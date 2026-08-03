import { NextRequest, NextResponse } from "next/server";
import { buildBackupSnapshot } from "@/lib/backup";
import { sendBackupEmail } from "@/lib/email";
import { captureError } from "@/lib/errorTracking";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const snapshot = await buildBackupSnapshot();
    const filename = `updatetech-backup-${new Date().toISOString().slice(0, 10)}.json`;
    await sendBackupEmail(JSON.stringify(snapshot, null, 2), filename);
    return NextResponse.json({ sent: true });
  } catch (err) {
    captureError(err, { cron: "backup-email" });
    return NextResponse.json({ error: "Échec de la sauvegarde." }, { status: 500 });
  }
}
