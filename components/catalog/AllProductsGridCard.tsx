"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import ProductImage from "@/components/media/ProductImage";
import {
  LIST_SCROLL_KEYS,
  catalogProductAnchorId,
  currentReturnPath,
  saveListScrollState,
  type ListScrollState,
} from "@/lib/catalog/list-scroll-restore";
import { getProductThumbnail } from "@/lib/inventory/media";
import { routes } from "@/lib/inventory/routes";
import type { CatalogProductCardData } from "./CatalogProductCard";
import WishlistButton from "@/components/wishlist/WishlistButton";
import SaleBadge, { isProductOnSale } from "@/components/product/SaleBadge";
import CompareButton from "@/components/compare/CompareButton";
import QuickViewModal from "./QuickViewModal";

export type CatalogAllSavedState = Omit<
  ListScrollState,
  "returnPath" | "listKey"
> & {
  page: number;
  query: string;
  categoryFilter: string;
  brandFilter: string;
  priceFilter: string;
  conditionFilter: string;
  sortFilter: string;
};

export function saveCatalogAllState(state: CatalogAllSavedState) {
  saveListScrollState(LIST_SCROLL_KEYS.catalogAll, {
    ...state,
    listKey: LIST_SCROLL_KEYS.catalogAll,
    returnPath: currentReturnPath(),
  });
}

/**
 * A listing in the marketplace grid.
 *
 * The card answers, in order: what is it, who made it, what does it fit, what
 * does it cost, can I buy it. Everything on it comes from the listing -- there
 * are no ratings, no review counts, no "23 sold today", no verification
 * badges, because the catalog holds no such data and inventing it would be
 * inventing trust.
 *
 * WHY THE SLOTS ARE HELD OPEN
 * The title takes two lines and the application one, whether the listing
 * fills them or not, and the price and button sit at the bottom of the card.
 * Letting those slots collapse is what made a row of tiles ragged: a quarter
 * of the catalogue's titles run past 95 characters while others are short,
 * and fitment is recorded on about two listings in three, so the price landed
 * at a different height on every card. Two reserved lines cost a little white
 * space on the shortest listings and buy a grid that reads as a grid.
 *
 * The part number is no longer here. It is on ~55% of listings, which made it
 * a second ragged line, and what a customer scanning a grid wants to know is
 * what the part fits -- the number is on the product page, in full.
 *
 * The application line is hidden on phones regardless. Two columns on a 375px
 * screen leaves roughly 166px of card, and fitment text set in that space is a
 * smudge; the name, the brand, the price and the button are what a phone needs.
 *
 * WHY THE IMAGE IS CONTAINED, NOT COVERED
 * This was object-cover, which fills the square by cropping. On a catalog of
 * gearboxes, body panels and truck beds that removes the ends of things, and
 * the silhouette of a part is most of what identifies it at thumbnail size.
 * Contain shows the whole part, and every card gets the same square, so the
 * grid still reads as a grid.
 *
 * Listings whose photograph is missing keep their placeholder rather than
 * borrowing a substitute, so the image audit can still see what is missing.
 */
export default function AllProductsGridCard({
  product,
  priority = false,
  onNavigate,
}: {
  product: CatalogProductCardData;
  priority?: boolean;
  onNavigate?: (productId: number) => void;
}) {
  const thumbnail = getProductThumbnail(product);
  const cartProduct: AddToCartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: thumbnail,
    category: product.category,
    brand: product.brand,
  };

  const productHref = routes.product(product.id);
  const onSale = isProductOnSale(product.price, product.compareAtPrice);
  const outOfStock = product.inStock === false;

  return (
    <article
      id={catalogProductAnchorId(product.id)}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-[3px] border border-neutral-200 bg-white transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] hover:border-neutral-400 hover:shadow-[0_12px_32px_-20px_rgba(0,0,0,0.5)]"
    >
      <Link
        href={productHref}
        className="absolute inset-0 z-10"
        aria-label={`View ${product.name}`}
        onClick={() => onNavigate?.(product.id)}
      />

      <div className="relative aspect-square w-full overflow-hidden border-b border-neutral-200 bg-neutral-50">
        <div className="absolute left-1.5 top-1.5 z-20 flex flex-col items-start gap-1">
          {product.isNew ? (
            <span className="rounded-[2px] bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-accent-foreground">
              New
            </span>
          ) : null}
          {onSale ? <SaleBadge /> : null}
        </div>

        <div className="absolute right-1.5 top-1.5 z-20">
          <WishlistButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              thumbnail,
              category: product.category,
              brand: product.brand,
            }}
            size="sm"
          />
        </div>

        {/* Desktop conveniences. Hidden on touch, where there is no hover to
            reveal them and the space is better spent on the listing. */}
        <div className="absolute inset-x-1.5 bottom-1.5 z-20 hidden gap-1 opacity-0 transition-opacity duration-[var(--motion-duration-fast)] group-hover:opacity-100 sm:flex">
          <CompareButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              thumbnail,
              category: product.category,
              brand: product.brand,
            }}
            className="flex-1 justify-center !bg-white"
          />
          <QuickViewModal productId={product.id} triggerClassName="flex-1 justify-center" />
        </div>

        <ProductImage
          src={thumbnail}
          alt={product.name}
          profile="grid"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="h-full w-full object-contain p-2 transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-state)] group-hover:scale-[1.03] sm:p-3"
        />
      </div>

      <div className="flex flex-1 flex-col p-2 sm:p-3">
        {product.brandName ? (
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-500 sm:text-[10px]">
            {product.brandName}
          </p>
        ) : null}

        {/*
          ALIGNMENT
          Two lines for the title and one for the application, held whether
          the listing fills them or not, then everything below pinned to the
          bottom of the card. A quarter of the catalogue's titles run past 95
          characters, and cards whose slots collapsed left the price and the
          button sitting at a different height on every tile in the row.

          The part number used to sit here too. Dropping it is not a loss:
          what a customer scanning a grid needs is what the part fits, the
          number belongs on the product page, and two optional lines at
          ~55% and ~66% coverage were most of the raggedness.
        */}
        <h3 className="mt-1 line-clamp-2 min-h-[2.75em] text-[11px] font-semibold leading-snug text-neutral-900 sm:text-[13px]">
          <TranslatedText as="span">{product.name}</TranslatedText>
        </h3>

        <p className="mt-0.5 hidden min-h-[1.375em] line-clamp-1 text-[10px] leading-snug text-neutral-500 sm:block">
          {product.fitment ? (
            <>
              <span className="text-neutral-400">Fits </span>
              {product.fitment}
            </>
          ) : null}
        </p>

        <div className="mt-auto pt-2">
          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="sm"
          />
        </div>

        {/* Condition and availability as recorded on the listing. "In stock"
            is not a quantity claim -- the catalog stores a boolean, so that is
            all this says. */}
        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[10px] text-neutral-500">
          <span
            className={
              outOfStock
                ? "font-semibold text-error"
                : "font-semibold text-success"
            }
          >
            {outOfStock ? "Out of stock" : "In stock"}
          </span>
          {product.condition ? (
            <>
              <span aria-hidden="true" className="text-neutral-300">
                ·
              </span>
              {/* The product page's own wording (getConditionLabel), not the
                  raw stored string -- a card reading "brand new" beside a page
                  reading "Brand New" is the same listing arguing with itself. */}
              <span className="capitalize">
                {product.conditionLabel ?? product.condition.replace(/-/g, " ")}
              </span>
            </>
          ) : null}
        </p>

        <div className="relative z-20 mt-2.5 [&_button]:py-2 [&_button]:text-[11px] sm:[&_button]:text-xs">
          <AddToCartButton product={cartProduct} compact />
        </div>
      </div>
    </article>
  );
}
