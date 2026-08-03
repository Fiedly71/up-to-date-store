const brands = ["Samsung", "OpenAI", "Amazon", "Tencent", "Spotify"];

export function BrandsStrip() {
  return (
    <div className="border-y border-[#E9ECEF] bg-[#F8F9FA]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-8 text-[#6C757D]">
        {brands.map((brand) => (
          <span key={brand} className="text-lg font-semibold">
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}
