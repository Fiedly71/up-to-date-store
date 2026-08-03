/** Distance de Levenshtein simple (nombre minimal de modifications pour
 * passer d'une chaîne à l'autre). Suffisant pour un catalogue de taille
 * modeste — pas optimisé pour des dizaines de milliers de produits. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/** Retourne les produits dont le nom "ressemble" à la requête (tolère les
 * fautes de frappe), triés par pertinence. Utilisé en repli quand la
 * recherche exacte (`contains`) ne renvoie aucun résultat. */
export function fuzzyMatch<T extends { name: string }>(
  query: string,
  candidates: T[],
  maxResults: number
): T[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scored = candidates
    .map((product) => {
      const words = product.name.toLowerCase().split(/\s+/);
      // On compare la requête à chaque mot du nom, et on garde la
      // meilleure similarité trouvée (permet de matcher "samsng" dans
      // "Téléphone Samsung Galaxy A54" même si ce n'est pas le 1er mot).
      let bestSimilarity = 0;
      for (const word of words) {
        const distance = levenshtein(q, word);
        const maxLen = Math.max(q.length, word.length);
        if (maxLen === 0) continue;
        const similarity = 1 - distance / maxLen;
        if (similarity > bestSimilarity) bestSimilarity = similarity;
      }
      return { product, similarity: bestSimilarity };
    })
    // Seuil de similarité assez permissif pour tolérer 1-2 fautes de frappe
    // sur un mot moyen, sans pour autant renvoyer n'importe quoi.
    .filter((s) => s.similarity >= 0.6)
    .sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, maxResults).map((s) => s.product);
}
