import { ContentManager } from "@/components/admin/ContentManager";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Contenu du site</h1>
      <ContentManager gate={gate} />
    </>
  );
}
