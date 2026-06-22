"use client";

import { useState } from "react";
import AdminShell, { StatCard } from "@/components/admin/AdminShell";
import { products } from "@/lib/inventory/products";
import type { AdPack } from "@/lib/ads/generator";

export default function AdminAdsPage() {
  const [productId, setProductId] = useState(String(products[0]?.id ?? 1));
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<AdPack | null>(null);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: Number(productId) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        setPack(null);
        return;
      }

      setPack(data as AdPack);
    } catch {
      setError("Ad generator unavailable");
    } finally {
      setLoading(false);
    }
  };

  const downloadPack = () => {
    if (!pack) return;
    const blob = new Blob([JSON.stringify(pack, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `drivora-ad-pack-${pack.productId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="Ad Generator">
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard label="Platforms" value="3" hint="Facebook, Google, TikTok output" />
        <StatCard label="Integration" value="Export Only" hint="No external API connected yet" />
        <StatCard label="Format" value="JSON" hint="Future-ready ad pack structure" />
      </div>

      <section className="mt-8 rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
        <h2 className="mb-4 text-xl font-bold">Generate Ad Pack</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm">
            <span className="mb-2 block text-zinc-600">Product</span>
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2"
            >
              {products.slice(0, 40).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate Ads"}
          </button>
          {pack ? (
            <button
              type="button"
              onClick={downloadPack}
              className="rounded-lg border border-zinc-200 px-5 py-2 text-sm font-semibold hover:border-red-500/40"
            >
              Download Ad Pack
            </button>
          ) : null}
        </div>
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </section>

      {pack ? (
        <section className="mt-8 space-y-6">
          <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
            <h3 className="mb-3 text-lg font-bold">Facebook Ads</h3>
            <div className="space-y-3 text-sm">
              {pack.facebookAds.map((ad, index) => (
                <div key={index} className="rounded-lg border border-zinc-100 p-4">
                  <p className="font-semibold">{ad.headline}</p>
                  <p className="mt-2 text-zinc-600">{ad.primaryText}</p>
                  <p className="mt-2 text-xs text-gray-500">CTA: {ad.callToAction}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
            <h3 className="mb-3 text-lg font-bold">Google Ads</h3>
            <div className="space-y-3 text-sm">
              {pack.googleAds.map((ad, index) => (
                <div key={index} className="rounded-lg border border-zinc-100 p-4">
                  <p className="font-semibold">{ad.headline}</p>
                  <p className="mt-2 text-zinc-600">{ad.description}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Keywords: {ad.keywords.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white shadow-sm border border-zinc-200 p-6">
            <h3 className="mb-3 text-lg font-bold">TikTok Script</h3>
            <pre className="whitespace-pre-wrap text-sm text-zinc-600">{pack.tiktokScript}</pre>
          </div>
        </section>
      ) : null}
    </AdminShell>
  );
}
