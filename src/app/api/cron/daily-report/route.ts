import { NextRequest, NextResponse } from "next/server";
import { computeDailyReport, renderDailyReportHtml } from "@/lib/dailyReport";
import { sendDailyReportEmail } from "@/lib/email";

// Sécurisé par un secret partagé (pas de session ici : c'est un scheduler,
// pas un utilisateur navigateur). Vercel Cron envoie automatiquement le
// header "Authorization: Bearer <CRON_SECRET>" si configuré dans vercel.json.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const report = await computeDailyReport();
  const html = renderDailyReportHtml(report);
  await sendDailyReportEmail(html);

  return NextResponse.json({ sent: true, total: report.grandTotal });
}
