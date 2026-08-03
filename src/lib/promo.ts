import { prisma } from "@/lib/prisma";

export async function computeDiscount(code: string, subtotal: number) {
  const promo = await prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!promo || !promo.active) return { valid: false as const, error: "Code promo invalide." };
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { valid: false as const, error: "Ce code promo a expiré." };
  }
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return { valid: false as const, error: "Ce code promo a atteint sa limite d'utilisation." };
  }

  const discount =
    promo.discountType === "PERCENT"
      ? Math.round((subtotal * promo.discountValue) / 100)
      : Math.min(promo.discountValue, subtotal);

  return { valid: true as const, promo, discount };
}
