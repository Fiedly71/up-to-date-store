import { prisma } from "@/lib/prisma";

export async function computeDailyReport(date: Date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: "PAID",
    },
    include: { items: { include: { product: true } } },
  });

  const onlineTotal = orders
    .filter((o) => o.channel === "ONLINE")
    .reduce((sum, o) => sum + o.total, 0);
  const posTotal = orders
    .filter((o) => o.channel === "POS")
    .reduce((sum, o) => sum + o.total, 0);

  const byPayment: Record<string, number> = {};
  for (const o of orders) {
    const key = o.paymentMethod ?? "AUTRE";
    byPayment[key] = (byPayment[key] ?? 0) + o.total;
  }

  const productCounts = new Map<string, { name: string; qty: number }>();
  for (const o of orders) {
    for (const item of o.items) {
      const key = item.productId;
      const existing = productCounts.get(key);
      const name = item.product?.name ?? "Produit";
      productCounts.set(key, { name, qty: (existing?.qty ?? 0) + item.quantity });
    }
  }
  const topProducts = [...productCounts.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lt: 3 } },
    select: { name: true, stock: true },
  });

  return {
    date: start,
    onlineTotal,
    posTotal,
    grandTotal: onlineTotal + posTotal,
    byPayment,
    topProducts,
    lowStockProducts,
    orderCount: orders.length,
  };
}

export function renderDailyReportHtml(report: Awaited<ReturnType<typeof computeDailyReport>>) {
  const paymentLabels: Record<string, string> = {
    CASH_HTG: "Cash (HTG)",
    CASH_USD: "Cash (USD)",
    MONCASH: "Moncash",
    STRIPE_CARD: "Carte / Stripe",
    AUTRE: "Autre",
  };

  const paymentRows = Object.entries(report.byPayment)
    .map(
      ([method, total]) =>
        `<tr><td>${paymentLabels[method] ?? method}</td><td style="text-align:right">$${(
          total / 100
        ).toFixed(2)}</td></tr>`
    )
    .join("");

  const topProductRows = report.topProducts
    .map((p) => `<tr><td>${p.name}</td><td style="text-align:right">${p.qty}</td></tr>`)
    .join("");

  const lowStockRows = report.lowStockProducts
    .map((p) => `<li>${p.name} — ${p.stock} unité(s) restante(s)</li>`)
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2>Rapport de clôture — ${report.date.toLocaleDateString("fr-FR")}</h2>
      <p><strong>Ventes comptoir :</strong> $${(report.posTotal / 100).toFixed(2)}</p>
      <p><strong>Ventes en ligne :</strong> $${(report.onlineTotal / 100).toFixed(2)}</p>
      <p><strong>Total du jour :</strong> $${(report.grandTotal / 100).toFixed(2)} (${
    report.orderCount
  } commande(s))</p>

      <h3>Ventilation par mode de paiement</h3>
      <table style="width:100%;border-collapse:collapse">${paymentRows || "<tr><td>Aucune vente</td></tr>"}</table>

      <h3>Produits les plus vendus aujourd'hui</h3>
      <table style="width:100%;border-collapse:collapse">${topProductRows || "<tr><td>Aucune vente</td></tr>"}</table>

      <h3>⚠️ Alertes stock bas (&lt; 3 unités)</h3>
      <ul>${lowStockRows || "<li>Aucune alerte</li>"}</ul>

      <p style="color:#6C757D;font-size:12px;margin-top:24px">UpDate Tech & Digital Solutions</p>
    </div>
  `;
}
