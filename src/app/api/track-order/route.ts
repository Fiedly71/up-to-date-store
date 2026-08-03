import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackOrderSchema, parseOrError } from "@/lib/validation";

const statusLabels: Record<string, string> = {
  DRAFT: "En attente de paiement",
  RESERVED: "En attente de paiement",
  PROFORMA: "Devis / proforma",
  PAID: "Payée — en préparation",
  PARTIALLY_PAID: "Acompte reçu — en préparation",
  CANCELLED: "Annulée",
  EXPIRED: "Expirée",
};

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(trackOrderSchema, await req.json());
  if (error) return error;

  const { orderId, email } = body;

  // On cherche par suffixe de l'id (l'utilisateur voit un id raccourci sur
  // son reçu) + email, pour ne jamais exposer une commande à quelqu'un
  // d'autre que le client concerné.
  const order = await prisma.order.findFirst({
    where: {
      id: { endsWith: orderId.trim() },
      customerEmail: { equals: email.trim(), mode: "insensitive" },
    },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Aucune commande trouvée avec ces informations." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    order: {
      id: order.id,
      status: statusLabels[order.status] ?? order.status,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        name: i.product?.name ?? "Produit",
        quantity: i.quantity,
      })),
    },
  });
}
