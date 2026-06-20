import { engineTree } from "@/data/engine";
import { slugify } from "@/data/store";
import CatalogCard from "./CatalogCard";

/* =========================================================
   ENGINE SYSTEM UI (SYSTEM B)
   ---------------------------------------------------------
   Structure difference ONLY (grouped hierarchy).
   Color/animation are the unified red/white system — every
   group looks identical. No per-group colors.
========================================================= */

export default function EngineGroups() {
  return (
    <div className="space-y-12">
      {engineTree.map((group) => (
        <section key={group.slug}>
          <h2 className="inline-block text-lg font-bold uppercase tracking-wide text-white border-b-2 border-red-600 pb-2 mb-5">
            {group.title}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {group.platforms.map((platform) => (
              <CatalogCard
                key={platform.name}
                href={`/catalog/engine/${slugify(platform.name)}`}
              >
                <span className="font-medium">{platform.name}</span>
              </CatalogCard>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
