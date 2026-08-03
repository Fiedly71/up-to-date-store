import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { TwoFactorSetup } from "@/components/admin/TwoFactorSetup";

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Sécurité de mon compte</h1>
      <TwoFactorSetup gate={gate} initiallyEnabled={user?.twoFactorEnabled ?? false} />
    </>
  );
}
