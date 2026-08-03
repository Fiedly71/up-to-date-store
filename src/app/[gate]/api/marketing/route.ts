import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { campaignCreateSchema, parseOrError } from "@/lib/validation";
import { sendCampaignToRecipients } from "@/lib/email";

async function requireSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== "SUPER_ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const [customers, campaigns] = await Promise.all([
    prisma.customer.findMany({ select: { email: true, tags: true } }),
    prisma.emailCampaign.findMany({ orderBy: { sentAt: "desc" }, take: 20 }),
  ]);

  const allTags = [...new Set(customers.flatMap((c) => c.tags))].sort();

  return NextResponse.json({
    totalCustomers: customers.length,
    tags: allTags,
    campaigns,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { data: body, error } = parseOrError(campaignCreateSchema, await req.json());
  if (error) return error;

  const customers = await prisma.customer.findMany({
    where: body.tagFilter ? { tags: { has: body.tagFilter } } : undefined,
    select: { email: true },
  });

  const sentCount = await sendCampaignToRecipients(
    customers.map((c) => c.email),
    body.subject,
    body.body.replace(/\n/g, "<br/>")
  );

  await prisma.emailCampaign.create({
    data: { subject: body.subject, body: body.body, tagFilter: body.tagFilter || null, sentCount },
  });

  return NextResponse.json({ sentCount, targeted: customers.length });
}
