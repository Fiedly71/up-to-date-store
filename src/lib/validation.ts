import { z } from "zod";
import { NextResponse } from "next/server";

/** Parse `data` avec `schema`; retourne soit les données validées, soit une
 * NextResponse 400 prête à renvoyer telle quelle. Évite de dupliquer le
 * try/catch + formatage d'erreur dans chaque route. */
export function parseOrError<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Données invalides.";
    return { data: null, error: NextResponse.json({ error: message }, { status: 400 }) };
  }
  return { data: result.data as z.infer<T>, error: null };
}

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  name: z.string().min(1).max(200),
  variantName: z.string().max(200).optional(),
  unitPrice: z.number().int().nonnegative().max(100_000_00),
  quantity: z.number().int().positive().max(50),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
  paymentPlan: z.enum(["FULL", "DEPOSIT_50", "INSTALLMENT_3"]).optional(),
  shippingZone: z.string().max(50).optional(),
  promoCode: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  usePoints: z.number().int().nonnegative().max(1_000_000).optional(),
});

export const submitBriefSchema = z.object({
  packSlug: z.string().min(1),
  fullName: z.string().min(1).max(200),
  whatsapp: z.string().min(1).max(50),
  email: z.string().email(),
  company: z.string().max(200).optional().or(z.literal("")),
  brief: z.string().min(1).max(5000),
  website: z.string().max(500).optional().or(z.literal("")), // honeypot anti-spam
});

export const promoValidateSchema = z.object({
  code: z.string().min(1).max(50),
  subtotal: z.number().int().nonnegative(),
});

export const reviewCreateSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(2000),
  images: z.array(z.string().max(2000)).max(3).optional(),
  website: z.string().max(500).optional().or(z.literal("")), // honeypot anti-spam
});

export const trackOrderSchema = z.object({
  orderId: z.string().min(4).max(64),
  email: z.string().email(),
});

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(100),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  lowStockAt: z.number().int().nonnegative().optional(),
  description: z.string().max(5000).optional().or(z.literal("")),
  images: z.string().max(2000).optional().or(z.literal("")),
  categoryId: z.string().nullable().optional(),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const posSaleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(999),
        unitPrice: z.number().int().nonnegative(),
      })
    )
    .min(1),
  customerName: z.string().max(200).optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().max(50).optional(),
  paymentMethod: z.enum(["CASH_HTG", "CASH_USD", "MONCASH", "STRIPE_CARD"]).optional(),
  asProforma: z.boolean().optional(),
});

// --- Contenu du site (dashboard, SUPER_ADMIN) ---

export const reviewModerationSchema = z.object({
  id: z.string().min(1),
  approved: z.boolean(),
});

export const testimonialCreateSchema = z.object({
  authorName: z.string().min(1).max(200),
  role: z.string().max(200).optional().or(z.literal("")),
  quote: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
});

export const testimonialModerationSchema = z.object({
  id: z.string().min(1),
  approved: z.boolean(),
});

export const postCreateSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1).max(50_000),
  coverImage: z.string().max(2000).optional().or(z.literal("")),
  published: z.boolean().optional(),
});

export const postUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  excerpt: z.string().min(1).max(500).optional(),
  content: z.string().min(1).max(50_000).optional(),
  coverImage: z.string().max(2000).optional().or(z.literal("")),
  published: z.boolean().optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
});

export const promoCreateSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.number().positive(),
  usageLimit: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().optional().or(z.literal("")),
});

export const promoModerationSchema = z.object({
  id: z.string().min(1),
  active: z.boolean(),
});

// --- Comptes clients ---

export const customerRegisterSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  phone: z.string().max(50).optional().or(z.literal("")),
  referralCode: z.string().max(50).optional().or(z.literal("")),
  website: z.string().max(500).optional().or(z.literal("")), // honeypot
});

export const customerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// --- Variantes produit (couleur/stockage) ---

export const variantCreateSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(100),
  stock: z.number().int().nonnegative().optional(),
  priceDiff: z.number().optional(), // dollars, converti en cents côté serveur
  colorHex: z.string().max(20).optional().or(z.literal("")),
  image: z.string().max(2000).optional().or(z.literal("")),
});

export const variantUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  stock: z.number().int().nonnegative().optional(),
  priceDiff: z.number().optional(),
  colorHex: z.string().max(20).optional().or(z.literal("")),
  image: z.string().max(2000).optional().or(z.literal("")),
});

// --- Comptes staff (dashboard) ---

export const staffCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["SUPER_ADMIN", "CASHIER"]),
});

export const staffUpdateSchema = z.object({
  id: z.string().min(1),
  active: z.boolean().optional(),
  role: z.enum(["SUPER_ADMIN", "CASHIER"]).optional(),
});

export const campaignCreateSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10_000),
  tagFilter: z.string().max(100).optional().or(z.literal("")),
});
