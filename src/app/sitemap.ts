import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uptodateelectronic.com";

  const staticPages = ["", "/shop", "/services", "/blog", "/suivi-commande", "/garantie"].map(
    (path) => ({ url: `${base}${path}`, lastModified: new Date() })
  );

  const [products, posts] = await Promise.all([
    prisma.product.findMany({ select: { id: true, updatedAt: true } }).catch(() => []),
    prisma.blogPost
      .findMany({ where: { published: true }, select: { slug: true, createdAt: true } })
      .catch(() => []),
  ]);

  const productPages = products.map((p) => ({
    url: `${base}/shop/${p.id}`,
    lastModified: p.updatedAt,
  }));

  const postPages = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.createdAt,
  }));

  return [...staticPages, ...productPages, ...postPages];
}
