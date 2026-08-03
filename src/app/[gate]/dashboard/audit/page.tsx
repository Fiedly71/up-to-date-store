import { AuditLogViewer } from "@/components/admin/AuditLogViewer";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Journal d&apos;audit</h1>
      <AuditLogViewer gate={gate} />
    </>
  );
}
