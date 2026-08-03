export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-[#F8F9FA]" />
        <div>
          <div className="mb-4 h-6 w-2/3 animate-pulse rounded bg-[#F8F9FA]" />
          <div className="mb-2 h-4 w-full animate-pulse rounded bg-[#F8F9FA]" />
          <div className="mb-8 h-4 w-1/2 animate-pulse rounded bg-[#F8F9FA]" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-[#F8F9FA]" />
        </div>
      </div>
    </div>
  );
}
