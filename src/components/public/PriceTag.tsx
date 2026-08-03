import { formatUsd, formatHtg } from "@/lib/currency";

export function PriceTag({
  cents,
  compareAtCents,
  size = "md",
}: {
  cents: number;
  compareAtCents?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const mainClass =
    size === "lg" ? "text-2xl font-semibold" : size === "sm" ? "text-sm font-semibold" : "text-base font-semibold";

  return (
    <span className="inline-flex flex-col">
      <span className={`${mainClass} text-[#FF523B]`}>
        {formatUsd(cents)}
        {compareAtCents ? (
          <span className="ml-2 text-xs font-normal text-[#6C757D] line-through">
            {formatUsd(compareAtCents)}
          </span>
        ) : null}
      </span>
      <span className="text-xs text-[#6C757D]">≈ {formatHtg(cents)}</span>
    </span>
  );
}
