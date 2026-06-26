export type PriceFilterValue =
  | "all"
  | "under-200"
  | "200-499"
  | "500-999"
  | "1000-2499"
  | "2500-4999"
  | "5000-plus";

export const PRICE_FILTER_OPTIONS: {
  value: PriceFilterValue;
  label: string;
  min: number;
  max: number;
}[] = [
  { value: "all", label: "Any Budget", min: 0, max: Number.POSITIVE_INFINITY },
  { value: "under-200", label: "Under $200", min: 0, max: 200 },
  { value: "200-499", label: "$200 – $499", min: 200, max: 500 },
  { value: "500-999", label: "$500 – $999", min: 500, max: 1000 },
  { value: "1000-2499", label: "$1,000 – $2,499", min: 1000, max: 2500 },
  { value: "2500-4999", label: "$2,500 – $4,999", min: 2500, max: 5000 },
  { value: "5000-plus", label: "$5,000+", min: 5000, max: Number.POSITIVE_INFINITY },
];

export function matchesPriceFilter(
  price: number,
  filter: PriceFilterValue
): boolean {
  const range =
    PRICE_FILTER_OPTIONS.find((option) => option.value === filter) ??
    PRICE_FILTER_OPTIONS[0];

  if (range.value === "all") return true;
  if (range.value === "5000-plus") return price >= range.min;
  return price >= range.min && price < range.max;
}
