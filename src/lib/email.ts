import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "UpDate <onboarding@resend.dev>";

export async function sendCampaignToRecipients(
  recipients: string[],
  subject: string,
  bodyHtml: string
) {
  if (!process.env.RESEND_API_KEY) return 0;

  let sent = 0;
  // Envoi individuel (pas de BCC groupé) : chaque client ne voit pas les
  // adresses des autres destinataires. Pour une petite liste, largement
  // suffisant ; au-delà de quelques centaines de destinataires, envisager
  // l'API "Batch" ou "Broadcast" de Resend plutôt qu'une boucle séquentielle.
  for (const to of recipients) {
    try {
      await resend.emails.send({
        from: FROM,
        to,
        subject,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">${bodyHtml}<p style="color:#6C757D;font-size:12px;margin-top:24px">UpDate Tech & Digital Solutions — Champin, Cap-Haïtien</p></div>`,
      });
      sent += 1;
    } catch {
      // On continue même si un envoi échoue (adresse invalide, etc.).
      continue;
    }
  }
  return sent;
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderId: string;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[];
}) {
  if (!process.env.RESEND_API_KEY) return; // pas de clé en dev — no-op silencieux

  const rows = params.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 0">${i.name} × ${i.quantity}</td><td style="text-align:right">$${(
          (i.unitPrice * i.quantity) /
          100
        ).toFixed(2)}</td></tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Confirmation de commande — UpDate #${params.orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Merci pour ta commande !</h2>
        <p>Voici le récapitulatif de ta commande <strong>#${params.orderId
          .slice(-8)
          .toUpperCase()}</strong> :</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="font-weight:bold;text-align:right">Total : $${(params.total / 100).toFixed(2)}</p>
        <p style="color:#6C757D;font-size:12px">UpDate Tech & Digital Solutions — Champin, Cap-Haïtien</p>
      </div>
    `,
  });
}

export async function sendBriefReceivedEmail(params: {
  packName: string;
  fullName: string;
  whatsapp: string;
  email: string;
  company?: string;
  brief: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) return;

  await resend.emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `Nouveau brief reçu — ${params.packName}`,
    html: `
      <div style="font-family:sans-serif">
        <h2>Nouveau brief : ${params.packName}</h2>
        <p><strong>Nom :</strong> ${params.fullName}</p>
        <p><strong>WhatsApp :</strong> ${params.whatsapp}</p>
        <p><strong>Email :</strong> ${params.email}</p>
        <p><strong>Entreprise :</strong> ${params.company || "—"}</p>
        <p><strong>Brief :</strong></p>
        <p style="white-space:pre-wrap">${params.brief}</p>
      </div>
    `,
  });
}

export async function sendDailyReportEmail(html: string) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) return;

  await resend.emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `Rapport de clôture — ${new Date().toLocaleDateString("fr-FR")}`,
    html,
  });
}

export async function sendAbandonedCartEmail(params: {
  to: string;
  checkoutUrl: string;
  items: { name: string; quantity: number }[];
}) {
  if (!process.env.RESEND_API_KEY) return;

  const itemsList = params.items.map((i) => `<li>${i.name} × ${i.quantity}</li>`).join("");

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: "Tu as oublié quelque chose dans ton panier UpDate 🛒",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Il te reste des articles en attente !</h2>
        <ul>${itemsList}</ul>
        <p>
          <a href="${params.checkoutUrl}" style="background:#FF523B;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">
            Finaliser ma commande
          </a>
        </p>
        <p style="color:#6C757D;font-size:12px">UpDate Tech & Digital Solutions — Champin, Cap-Haïtien</p>
      </div>
    `,
  });
}

export async function sendBackupEmail(jsonContent: string, filename: string) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) return;

  await resend.emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `Sauvegarde hebdomadaire UpDate — ${new Date().toLocaleDateString("fr-FR")}`,
    html: `
      <div style="font-family:sans-serif">
        <p>Export de sauvegarde des données du site, en pièce jointe (JSON).</p>
        <p style="color:#6C757D;font-size:12px">
          Rappel : cette sauvegarde logique complète les sauvegardes
          automatiques de ton hébergeur de base de données (Supabase/Neon).
          Elle ne les remplace pas.
        </p>
      </div>
    `,
    attachments: [
      {
        filename,
        content: Buffer.from(jsonContent).toString("base64"),
      },
    ],
  });
}
