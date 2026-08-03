// Taux de change USD → HTG. Les taux fluctuent beaucoup en Haïti — à mettre
// à jour régulièrement (ou brancher une API de taux plus tard, ex.
// exchangerate.host). Pour l'instant, valeur configurable ici en un seul
// endroit.
export const USD_TO_HTG_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_HTG_RATE ?? 144);

export function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatHtg(cents: number) {
  const htg = (cents / 100) * USD_TO_HTG_RATE;
  return `${Math.round(htg).toLocaleString("fr-FR")} HTG`;
}
