import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { getMarketingAutopilotBundle } from "@/lib/ai/decision-engine";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminMarketingPage() {
  const bundle = await getMarketingAutopilotBundle();

  return (
    <AdminShell title="Marketing Autopilot">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Viral Products"
          value={String(bundle.viral.products.length)}
          hint="Score ≥ 20 detected automatically"
        />
        <StatCard
          label="Autopilot Ads"
          value={String(bundle.autopilot.ads.length)}
          hint="TikTok · Meta · Google variants"
        />
        <StatCard
          label="Pricing Actions"
          value={String(bundle.pricing.recommendations.length)}
          hint={`${bundle.pricing.marginFloorPercent}% margin floor protected`}
        />
        <StatCard
          label="Conversion Forecast"
          value={bundle.conversionPrediction.next7DayLift}
          hint={`Confidence: ${bundle.conversionPrediction.confidence}`}
        />
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-2 text-xl font-bold">AI Decision Summary</h2>
        <p className="text-sm text-gray-300">{bundle.decisions.summary}</p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Top Viral Products</h2>
          <ul className="space-y-2 text-sm">
            {bundle.viral.products.length === 0 ? (
              <li className="text-gray-400">No viral signals yet.</li>
            ) : (
              bundle.viral.products.map((product) => (
                <li key={product.productId} className="flex justify-between gap-4">
                  <span>{product.name}</span>
                  <span className="text-red-400">{product.viralScore}/100</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Pricing Suggestions</h2>
          <ul className="space-y-2 text-sm">
            {bundle.pricing.recommendations.slice(0, 6).map((rec) => (
              <li key={rec.productId} className="flex justify-between gap-4">
                <span>{rec.productName}</span>
                <span className="capitalize text-gray-400">
                  {rec.direction} → ${rec.suggestedPrice}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 text-xl font-bold">Auto-Generated Ads</h2>
        <div className="space-y-4">
          {bundle.autopilot.ads.slice(0, 9).map((ad, index) => (
            <article key={`${ad.platform}-${ad.productId}-${index}`} className="rounded-lg border border-white/5 p-4 text-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-semibold uppercase text-red-400">{ad.platform}</span>
                <span className="text-gray-500">Product #{ad.productId}</span>
              </div>
              <p className="font-medium">{ad.hook}</p>
              <p className="mt-2 text-gray-300">{ad.adCopy}</p>
              <p className="mt-2 text-xs text-gray-500">CTA: {ad.cta} · Target: {ad.targeting.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Content Packs</h2>
          <ul className="space-y-3 text-sm">
            {bundle.content.packs.slice(0, 4).map((pack) => (
              <li key={pack.productId} className="rounded-lg border border-white/5 p-3">
                <p className="font-medium">{pack.productName}</p>
                <p className="mt-2 line-clamp-2 text-gray-400">{pack.tiktokCaption}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="mb-4 text-xl font-bold">Customer Behavior</h2>
          <p className="mb-4 text-sm text-gray-300">
            Cart abandonment {bundle.behavior.overallCartAbandonmentRate}% · Purchase likelihood{" "}
            {bundle.behavior.averagePurchaseLikelihood}/100
          </p>
          <ul className="space-y-2 text-sm">
            {bundle.behavior.segments.slice(0, 4).map((segment) => (
              <li key={segment.segment} className="flex justify-between gap-4">
                <span>{segment.segment}</span>
                <span className="text-gray-400">{segment.purchaseLikelihood}% likely</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
