"use client";

import { useEffect, useState } from "react";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import {
  HOME_FEATURED_ROTATE_MS,
  getFeaturedBatch,
  getFeaturedTimeSlot,
} from "@/lib/home/featured-products";
import HomeFeaturedGrid from "./HomeFeaturedGrid";

/**
 * Featured products above the trust band — advances every 10 minutes
 * while the visitor keeps the homepage open.
 */
export default function HomeFeaturedRotator({
  pool,
  initialBatch,
}: {
  pool: CatalogProductCardData[];
  initialBatch: CatalogProductCardData[];
}) {
  const [batch, setBatch] = useState(initialBatch);

  useEffect(() => {
    const syncBatch = () => {
      setBatch(getFeaturedBatch(pool, getFeaturedTimeSlot()));
    };

    syncBatch();
    const id = window.setInterval(syncBatch, HOME_FEATURED_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [pool]);

  return <HomeFeaturedGrid products={batch} />;
}
