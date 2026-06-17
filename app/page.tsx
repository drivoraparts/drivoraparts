"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { products } from "@/data/products";

type Product = (typeof products)[number];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [compare, setCompare] = useState<number[]>([]);
  const [preview, setPreview] = useState<Product | null>(null);

  const perPage = 6;

  const categories = [
    "all",
    "engines",
    "turbochargers",
    "brakes",
    "suspension",
    "electronics",
    "transmissions",
    "headlights",
    "interiors",
    "body-parts",
  ];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === "all" || p.category === category;
      const matchSearch =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [query, category]);

  const totalPages = Math.ceil(filtered.length / perPage);

  const paginated = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleCompare = (id: number) => {
    setCompare((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const compareItems = products.filter((p) =>
    compare.includes(p.id)
  );

  return (
    <main style={{ background: "#0b0f14", color: "white", minHeight: "100vh" }}>
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px",
          borderBottom: "1px solid #1f2937",
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>
          Drivora<span style={{ color: "#ff3b3b" }}>Parts</span>
        </h2>

        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search parts..."
          style={{
            flex: 1,
            margin: "0 12px",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <Link href="/">Home</Link>
      </header>

      {/* CATEGORY BAR */}
      <div style={{ display: "flex", gap: "8px", padding: "10px", overflowX: "auto" }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: "20px",
              border: "1px solid #333",
              background: category === c ? "#ff3b3b" : "#111827",
              color: "white",
              fontSize: "12px",
              textTransform: "capitalize",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* COMPARE BAR */}
      {compare.length > 0 && (
        <div
          style={{
            padding: "10px",
            borderBottom: "1px solid #1f2937",
            background: "#111827",
          }}
        >
          <strong>Compare ({compare.length}/3):</strong>{" "}
          {compareItems.map((p) => p.name).join(" vs ")}
        </div>
      )}

      {/* PRODUCTS */}
      <section style={{ padding: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          {paginated.map((product) => {
            const isWish = wishlist.includes(product.id);
            const isCompare = compare.includes(product.id);

            return (
              <div
                key={product.id}
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: "12px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* IMAGE CLICK PREVIEW */}
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  onClick={() => setPreview(product)}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                />

                <div style={{ padding: "10px" }}>
                  <h3 style={{ fontSize: "13px" }}>{product.name}</h3>
                  <p style={{ fontSize: "11px", opacity: 0.7 }}>
                    ${product.price}
                  </p>

                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    {/* WISHLIST */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      style={{
                        fontSize: "10px",
                        padding: "5px",
                        background: isWish ? "red" : "#1f2937",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                      }}
                    >
                      ♥
                    </button>

                    {/* COMPARE */}
                    <button
                      onClick={() => toggleCompare(product.id)}
                      style={{
                        fontSize: "10px",
                        padding: "5px",
                        background: isCompare ? "green" : "#1f2937",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                      }}
                    >
                      ⚖
                    </button>

                    <Link
                      href={`/product/${product.id}`}
                      style={{
                        fontSize: "10px",
                        padding: "5px",
                        background: "#ff3b3b",
                        borderRadius: "6px",
                      }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            gap: "10px",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: "6px 10px" }}
          >
            Prev
          </button>

          <span>
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: "6px 10px" }}
          >
            Next
          </button>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#111827",
              padding: "20px",
              borderRadius: "12px",
              width: "300px",
            }}
          >
            <img
              src={preview.thumbnail}
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <h3>{preview.name}</h3>
            <p>${preview.price}</p>
            <p style={{ fontSize: "12px", opacity: 0.7 }}>
              {preview.description}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}