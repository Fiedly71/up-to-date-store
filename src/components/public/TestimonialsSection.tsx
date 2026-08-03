import { prisma } from "@/lib/prisma";
import { StarRating } from "@/components/public/StarRating";

export async function TestimonialsSection() {
  const testimonials = await prisma.testimonial
    .findMany({ where: { approved: true }, orderBy: { createdAt: "desc" }, take: 6 })
    .catch(() => []);

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-[#F8F9FA] py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-2xl font-semibold">Ce que disent nos clients</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-2xl border border-[#E9ECEF] bg-white p-6">
              <StarRating rating={t.rating} />
              <p className="my-3 text-sm text-[#6C757D]">&quot;{t.quote}&quot;</p>
              <p className="text-sm font-medium">
                {t.authorName}
                {t.role && <span className="text-[#6C757D]"> — {t.role}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
