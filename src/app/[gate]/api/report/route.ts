import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { computeDailyReport, renderDailyReportHtml } from "@/lib/dailyReport";
import { sendDailyReportEmail } from "@/lib/email";

async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const report = await computeDailyReport();
  return NextResponse.json({ report, html: renderDailyReportHtml(report) });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const report = await computeDailyReport();
  await sendDailyReportEmail(renderDailyReportHtml(report));
  return NextResponse.json({ sent: true });
}
