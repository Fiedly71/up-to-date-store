export function StoreMap() {
  const query = process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "Champin, Cap-Haïtien, Haïti";
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="mb-6 text-2xl font-semibold">Notre boutique physique</h2>
      <div className="overflow-hidden rounded-2xl border border-[#E9ECEF]">
        <iframe
          title="Localisation UpDate Tech & Digital Solutions"
          src={src}
          className="h-80 w-full"
          loading="lazy"
        />
      </div>
      <p className="mt-3 text-sm text-[#6C757D]">{query}</p>
    </section>
  );
}
