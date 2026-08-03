import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } }).catch(() => null);

  if (!post) return { title: "Article introuvable — UpDate" };

  return {
    title: `${post.title} — Blog UpDate`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blogPost
    .findUnique({ where: { slug } })
    .catch(() => null);

  if (!post || !post.published) notFound();

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-2xl px-4 py-16">
        <p className="mb-2 text-xs text-[#6C757D]">
          {new Date(post.createdAt).toLocaleDateString("fr-FR")}
        </p>
        <h1 className="mb-6 text-2xl font-semibold">{post.title}</h1>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-[#1A1A1A]">
          {post.content}
        </div>
      </main>
      <Footer />
    </>
  );
}
