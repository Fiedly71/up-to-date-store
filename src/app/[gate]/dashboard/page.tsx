import { PosTerminal } from "@/components/admin/PosTerminal";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Caisse rapide</h1>
      <PosTerminal gate={gate} />
    </>
  );
}
