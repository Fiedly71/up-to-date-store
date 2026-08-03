import { SalesList } from "@/components/admin/SalesList";

export default async function SalesPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Ventes & Factures</h1>
      <SalesList gate={gate} />
    </>
  );
}
