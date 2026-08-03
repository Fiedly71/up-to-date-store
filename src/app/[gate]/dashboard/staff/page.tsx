import { StaffManager } from "@/components/admin/StaffManager";

export default async function StaffPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Comptes staff</h1>
      <StaffManager gate={gate} />
    </>
  );
}
