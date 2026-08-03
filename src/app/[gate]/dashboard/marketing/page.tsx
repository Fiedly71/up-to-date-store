import { MarketingManager } from "@/components/admin/MarketingManager";

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Marketing par email</h1>
      <MarketingManager gate={gate} />
    </>
  );
}
