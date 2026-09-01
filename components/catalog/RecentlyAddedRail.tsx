import ProductRail from "./ProductRail";
import { getAllProducts } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

export default function RecentlyAddedRail({
  eyebrow = "Just Listed",
  title = "Fresh Inventory",
  tone,
}: {
  eyebrow?: string;
  title?: string;
  tone?: "light" | "muted";
}) {
  // This was slice(0, 12) of the catalog in whatever order the arrays happen
  // to concatenate, under the heading "Fresh Inventory" and a "New" badge on
  // every card. It was neither fresh nor new -- it was the first twelve
  // listings, and it would have stayed the same twelve as stock changed.
  //
  // Only ~216 of ~1,890 listings carry a createdAt, so the rest sort as though
  // timestamped zero and never reach this rail. That is the correct outcome:
  // a listing with no recorded date cannot honestly be called recent.
  const products = [...getAllProducts()]
    .filter((p) => typeof p.createdAt === "number")
    // Same tiebreaker as the catalog query, for the reason recorded there:
    // future-dated createdAt values that tie, whose order otherwise depends
    // on module load timing. Without it this rail and the grid above it
    // order "newest" differently on the same page.
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0) || b.id - a.id)
    .slice(0, 12);

  return (
    <ProductRail
      eyebrow={eyebrow}
      title={title}
      products={products}
      viewAllHref={routes.all}
      badge="New"
      tone={tone}
    />
  );
}
