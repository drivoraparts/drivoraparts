"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import ProductImage from "@/components/media/ProductImage";
import { getProductDiscountLabel } from "@/lib/inventory/discounts";
import {
  catalogProductAnchorId,
  saveListScrollOnProductClick,
} from "@/lib/catalog/list-scroll-restore";
import { getProductThumbnail } from "@/lib/inventory/media";
import { routes } from "@/lib/inventory/routes";
import WishlistButton from "@/components/wishlist/WishlistButton";
import SaleBadge, { isProductOnSale } from "@/components/product/SaleBadge";

export type CatalogProductCardData = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  images?: string[];
  category: string;
  brand?: string;
  isNew?: boolean;
  /**
   * Supplied by the catalog query where the listing actually has them.
   * Coverage measured 2026-09-20: partNumber 55%, fitment 66%, condition and
   * stock 100%. The marketplace grid reserves a line for the application so
   * its tiles align; anything scarcer than that stays off the card.
   */
  brandName?: string;
  partNumber?: string;
  fitment?: string;
  condition?: string;
  conditionLabel?: string;
  inStock?: boolean;
};

export default function CatalogProductCard({
  product,
  scrollListKey,
  detailed = false,
}: {
  product: CatalogProductCardData;
  scrollListKey?: string;
  /*
   * The rails' density.
   *
   * A rail card used to print a name, a price and the bulk-offer line, which
   * meant that scrolling down /catalog/all the cards got LESS informative than
   * the grid directly above them -- the grid was already showing the brand,
   * what the part fits, its condition and whether it was in stock, from data
   * this card's own type had always declared and nothing had ever filled.
   *
   * It is a prop rather than the new default because this component is also
   * the card on the category, brand, engine-platform, vehicle and wishlist
   * pages, and those hand it a minimal object with none of these fields. They
   * would gain nothing and would pay for it in reserved empty rows, so they
   * keep exactly the card they have until their own data is widened.
   */
  detailed?: boolean;
}) {
  const thumbnail = getProductThumbnail(product);
  const outOfStock = product.inStock === false;

  const cartProduct: AddToCartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: thumbnail,
    category: product.category,
    brand: product.brand,
  };

  const productHref = routes.product(product.id);

  return (
    /*
     * A column, so every card in a row ends on its button.
     *
     * These sit in rails where the row is as tall as its tallest card, and a
     * quarter of the catalogue's titles run past 95 characters. An unclamped
     * title used to set the height for eleven other cards and leave their
     * buttons floating at different heights; the title now holds two lines
     * whatever it says, and the price and button are pinned to the bottom.
     */
    <article
      id={catalogProductAnchorId(product.id)}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:border-accent-border hover:shadow-lg"
    >
      <Link
        href={productHref}
        // touch-manipulation drops the browser's ~300ms double-tap-to-zoom
        // wait on this target, which is what made a tap feel like it hadn't
        // registered. HomeFeaturedCard already had it; the catalog card,
        // which is most of the site's tiles, did not.
        className="touch-manipulation absolute inset-0 z-10 rounded-xl"
        aria-label={`View ${product.name}`}
        onClick={() => {
          if (scrollListKey) {
            saveListScrollOnProductClick(scrollListKey, product.id);
          }
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-accent/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex flex-1 flex-col p-4">
        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          {isProductOnSale(product.price, product.compareAtPrice) ? (
            <div className="absolute left-1.5 top-1.5 z-20">
              <SaleBadge />
            </div>
          ) : null}
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
          {/* Contained, not cropped -- same reason as the marketplace grid:
              a cover crop takes the ends off gearboxes and body panels, and
              a part's silhouette is most of what identifies it this small. */}
          <ProductImage
            src={thumbnail}
            alt={product.name}
            profile="grid"
            className="h-full w-full object-contain p-2 transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-state)] group-hover:scale-[1.03]"
          />
        </div>

        {/*
          BRAND · PRODUCT · FITMENT · CONDITION/AVAILABILITY · PRICE · CTA.

          The order is the order a buyer reads a part in: who made it, what it
          is, whether it fits their vehicle, what state it is in, what it
          costs. The wording and the condition resolution are the marketplace
          grid's own (AllProductsGridCard), not a second vocabulary -- a rail
          card reading "brand new" beside a grid card reading "Brand New" is
          the same catalogue arguing with itself.
        */}
        <div className="mt-3 flex flex-1 flex-col rounded-lg">
          {detailed && product.brandName ? (
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-500 sm:text-[10px]">
              {product.brandName}
            </p>
          ) : null}

          {/* Two lines, reserved whether the title fills them or not, so the
              cards beside this one keep their shape. */}
          <h3
            className={`line-clamp-2 min-h-[2.75em] text-sm font-semibold leading-snug text-neutral-900 group-hover:text-accent-hover ${
              detailed && product.brandName ? "mt-0.5" : ""
            }`}
          >
            <TranslatedText as="span">{product.name}</TranslatedText>
          </h3>

          {/* One line, height reserved whether this listing records a fitment
              or not (about one in six does not), so a row of cards keeps a
              common baseline instead of the price landing at a different
              height on every one. Shown at every width: what a part fits is
              the question a parts buyer is actually asking, and a rail card
              that withholds it on a phone is withholding the answer. */}
          {detailed ? (
            <p className="mt-0.5 line-clamp-1 min-h-[1.375em] text-[10px] leading-snug text-neutral-500">
              {product.fitment ? (
                <>
                  <span className="text-neutral-400">Fits </span>
                  {product.fitment}
                </>
              ) : null}
            </p>
          ) : null}

          <div className="mt-auto pt-2">
            <ProductPrice
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="md"
            />

            {detailed ? (
              /* Condition and availability exactly as the grid states them.
                 "In stock" is not a quantity claim -- the catalog stores a
                 boolean, so that is all this says. */
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
                    <span className="capitalize">
                      {product.conditionLabel ??
                        product.condition.replace(/-/g, " ")}
                    </span>
                  </>
                ) : null}
              </p>
            ) : (
              /*
                The bulk offer is real and it stays, but it is the same
                sentence on every card in every rail -- one site-wide policy
                repeated fifty-two times on a single page, competing with
                fifty-two different products for attention, and it is already
                stated in the announcement bar and again on the product page.
                In a rail the condition and stock of THIS part is worth more
                of that line than a policy that applies to all of them, so the
                detailed card spends it there. Nothing about the discount
                itself changes: the calculation, the cart and the product page
                are untouched.
              */
              <p className="mt-1.5 text-[10px] font-medium text-neutral-500">
                {getProductDiscountLabel(product.category)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-20 px-4 pb-4">
        <AddToCartButton product={cartProduct} compact />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-accent transition-all duration-300 group-hover:w-full" />
    </article>
  );
}
