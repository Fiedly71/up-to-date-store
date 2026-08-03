import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost
    .findMany({ where: { published: true }, orderBy: { createdAt: "desc" } })
    .catch(() => []);

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-2xl font-semibold">Blog Tech</h1>

        {posts.length === 0 ? (
          <p className="text-sm text-[#6C757D]">
            Aucun article publié pour l&apos;instant. Ajoute des articles via
            Prisma Studio (table <code>BlogPost</code>) pour qu&apos;ils
            apparaissent ici.
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-[#E9ECEF] p-6 transition hover:border-[#FF523B]"
              >
                <p className="mb-1 text-xs text-[#6C757D]">
                  {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <h2 className="mb-2 text-lg font-semibold">{post.title}</h2>
                <p className="text-sm text-[#6C757D]">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
