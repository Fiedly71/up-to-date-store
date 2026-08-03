import { prisma } from "@/lib/prisma";

export async function buildBackupSnapshot() {
  const [
    products,
    variants,
    categories,
    orders,
    orderItems,
    users,
    serviceBriefs,
    reviews,
    blogPosts,
    testimonials,
    promoCodes,
  ] = await Promise.all([
    prisma.product.findMany(),
    prisma.variant.findMany(),
    prisma.category.findMany(),
    prisma.order.findMany(),
    prisma.orderItem.findMany(),
    // Jamais le hash du mot de passe dans un export de sauvegarde.
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } }),
    prisma.serviceBrief.findMany(),
    prisma.review.findMany(),
    prisma.blogPost.findMany(),
    prisma.testimonial.findMany(),
    prisma.promoCode.findMany(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    products,
    variants,
    categories,
    orders,
    orderItems,
    users,
    serviceBriefs,
    reviews,
    blogPosts,
    testimonials,
    promoCodes,
  };
}
