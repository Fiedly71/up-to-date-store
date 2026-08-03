import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServicePack } from "@/lib/servicePacks";
import { sendBriefReceivedEmail } from "@/lib/email";
import { notifyBriefReceivedWhatsApp } from "@/lib/notifications";
import { submitBriefSchema, parseOrError } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(submitBriefSchema, await req.json());
  if (error) return error;

  const { packSlug, fullName, whatsapp, email, company, brief, website } = body;

  // Honeypot : un humain ne remplit jamais ce champ caché. On répond comme
  // si tout s'était bien passé (pour ne pas signaler au bot qu'il a été
  // détecté), mais on ne crée rien et n'envoie aucune notification.
  if (website) {
    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_SITE_URL}/services/brief/merci` });
  }

  const pack = getServicePack(packSlug);
  if (!pack) {
    return NextResponse.json({ error: "Pack introuvable." }, { status: 400 });
  }

  await prisma.serviceBrief.create({
    data: {
      kind: pack.kind,
      packName: pack.name,
      fullName,
      whatsapp,
      email,
      company,
      brief,
    },
  });

  await sendBriefReceivedEmail({ packName: pack.name, fullName, whatsapp, email, company, brief });
  await notifyBriefReceivedWhatsApp({ packName: pack.name, fullName, whatsapp });

  // Projet sur mesure : pas de paiement, juste une confirmation de
  // réception. La direction recontacte le client avec un devis.
  if (pack.kind === "CUSTOM_QUOTE") {
    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_SITE_URL}/services/brief/merci` });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: pack.price,
          product_data: { name: pack.name },
        },
        quantity: 1,
      },
    ],
    metadata: { packSlug },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
