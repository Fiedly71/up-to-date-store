export function StarRating({
  rating,
  count,
  size = "md",
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(rating);
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <span className="text-[#FF523B]">
        {"★".repeat(rounded)}
        <span className="text-[#E9ECEF]">{"★".repeat(5 - rounded)}</span>
      </span>
      {count !== undefined && <span className="text-[#6C757D]">({count})</span>}
    </div>
  );
}
