import { ReportPreview } from "@/components/admin/ReportPreview";
import { BackupExportButton } from "@/components/admin/BackupExportButton";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Rapport de clôture quotidien</h1>
      <ReportPreview gate={gate} />

      <div className="mt-8">
        <BackupExportButton gate={gate} />
      </div>
    </>
  );
}
