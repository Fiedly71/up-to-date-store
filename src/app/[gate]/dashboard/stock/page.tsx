import { StockManager } from "@/components/admin/StockManager";

export default async function StockPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Stock & Produits</h1>
      <StockManager gate={gate} />
    </>
  );
}
