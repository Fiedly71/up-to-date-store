export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[#F8F9FA]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#E9ECEF] p-3">
            <div className="mb-3 aspect-square animate-pulse rounded-lg bg-[#F8F9FA]" />
            <div className="mb-2 h-3 w-3/4 animate-pulse rounded bg-[#F8F9FA]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-[#F8F9FA]" />
          </div>
        ))}
      </div>
    </div>
  );
}
