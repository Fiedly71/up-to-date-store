// Notifications WhatsApp/SMS — utilise l'API Twilio (la plus fiable pour
// WhatsApp Business en Haïti). Reste un no-op silencieux tant que les
// variables TWILIO_* ne sont pas configurées, pour ne jamais faire planter
// le reste du flux (paiement, vente comptoir) si ce n'est pas encore branché.

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // ex. "whatsapp:+14155238886"
const ADMIN_WHATSAPP_TO = process.env.ADMIN_WHATSAPP_TO; // ex. "whatsapp:+50932836938"

async function sendWhatsApp(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) return;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: TWILIO_WHATSAPP_FROM,
      To: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
      Body: body,
    }),
  }).catch(() => {
    // On avale l'erreur : une notification WhatsApp ratée ne doit jamais
    // faire échouer une vente ou un paiement déjà confirmé.
  });
}

export async function notifyOrderPaidWhatsApp(params: {
  orderId: string;
  total: number;
  customerPhone?: string;
}) {
  const shortId = params.orderId.slice(-8).toUpperCase();
  const amount = (params.total / 100).toFixed(2);

  if (ADMIN_WHATSAPP_TO) {
    await sendWhatsApp(
      ADMIN_WHATSAPP_TO,
      `🛒 Nouvelle vente en ligne #${shortId} — $${amount}`
    );
  }

  if (params.customerPhone) {
    await sendWhatsApp(
      params.customerPhone,
      `Merci pour ta commande UpDate #${shortId} ! Paiement confirmé ($${amount}). On te tient au courant pour la livraison.`
    );
  }
}

export async function notifyBriefReceivedWhatsApp(params: {
  packName: string;
  fullName: string;
  whatsapp: string;
}) {
  if (!ADMIN_WHATSAPP_TO) return;
  await sendWhatsApp(
    ADMIN_WHATSAPP_TO,
    `📋 Nouveau brief : ${params.packName} — ${params.fullName} (${params.whatsapp})`
  );
}
