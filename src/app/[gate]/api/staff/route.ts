import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME, hashPassword } from "@/lib/auth";
import { staffCreateSchema, staffUpdateSchema, parseOrError } from "@/lib/validation";
import { logAdminAction } from "@/lib/audit";

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

  const staff = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true, twoFactorEnabled: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { data: body, error } = parseOrError(staffCreateSchema, await req.json());
  if (error) return error;

  const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email.toLowerCase(), passwordHash, role: body.role },
  });

  await logAdminAction({
    actorId: session.userId,
    action: "staff.created",
    targetType: "User",
    targetId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { data: body, error } = parseOrError(staffUpdateSchema, await req.json());
  if (error) return error;

  // Empêche de se désactiver soi-même ou de se rétrograder — évite de se
  // retrouver bloqué hors du dashboard sans autre SUPER_ADMIN disponible.
  if (body.id === session.userId && (body.active === false || body.role === "CASHIER")) {
    return NextResponse.json(
      { error: "Tu ne peux pas te désactiver ou te rétrograder toi-même." },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = {};
  if (body.active !== undefined) data.active = body.active;
  if (body.role !== undefined) data.role = body.role;

  const user = await prisma.user.update({ where: { id: body.id }, data });

  await logAdminAction({
    actorId: session.userId,
    action: body.active === false ? "staff.deactivated" : body.role ? "staff.role_changed" : "staff.updated",
    targetType: "User",
    targetId: user.id,
    metadata: data,
  });

  return NextResponse.json({ ok: true });
}
