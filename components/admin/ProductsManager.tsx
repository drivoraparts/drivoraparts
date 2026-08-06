"use client";

import { useMemo, useState } from "react";
import { adminUi } from "./admin-ui";
import type { Product } from "@/lib/inventory/types";
import { categories } from "@/lib/inventory/categories";
import { brands } from "@/lib/inventory/brands";

const PAGE_SIZE = 50;

type FormState = {
  id?: number;
  name: string;
  category: string;
  brand: string;
  price: string;
  stock: boolean;
  stockQty: string;
  condition: string;
  description: string;
  thumbnail: string;
  warranty: string;
  fitment: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  category: categories[0]?.slug ?? "",
  brand: brands[0]?.slug ?? "",
  price: "",
  stock: true,
  stockQty: "",
  condition: "brand-new",
  description: "",
  thumbnail: "",
  warranty: "",
  fitment: "",
};

function productToForm(product: Product): FormState {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    price: String(product.price),
    stock: product.stock ?? true,
    stockQty: product.stockQty != null ? String(product.stockQty) : "",
    condition: product.condition ?? "brand-new",
    description: product.description ?? "",
    thumbnail: product.thumbnail ?? "",
    warranty: product.warranty ?? "",
    fitment: product.fitment ?? "",
  };
}

function formToPayload(form: FormState): Partial<Product> {
  return {
    name: form.name.trim(),
    category: form.category,
    brand: form.brand,
    price: Number(form.price),
    stock: form.stock,
    stockQty: form.stockQty.trim() ? Number(form.stockQty) : undefined,
    condition: form.condition,
    // Intentionally NOT `|| undefined` for these: undefined-valued keys get
    // dropped by JSON.stringify, so clearing a field in the form would
    // never actually reach the server — the stale override value would
    // survive silently. Sending "" and letting the server-side merge treat
    // blank as "remove this override" is what makes clearing actually work.
    description: form.description.trim(),
    thumbnail: form.thumbnail.trim(),
    warranty: form.warranty.trim(),
    fitment: form.fitment.trim(),
  };
}

type ViewMap = Map<number, number>;

export default function ProductsManager({
  initialProducts,
  viewMap,
  cartMap,
}: {
  initialProducts: Product[];
  viewMap: ViewMap;
  cartMap: ViewMap;
}) {
  const [items, setItems] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCommitUrl, setLastCommitUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categoryOptions = categories;
  const brandOptions = brands.filter((b) => b.category === form.category);

  function openAdd() {
    setForm(EMPTY_FORM);
    setError(null);
    setModal("add");
  }

  function openEdit(product: Product) {
    setForm(productToForm(product));
    setError(null);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setError(null);
  }

  async function submitForm() {
    setSaving(true);
    setError(null);
    try {
      const payload = formToPayload(form);
      const isEdit = modal === "edit" && form.id != null;
      const res = await fetch(
        isEdit ? `/api/admin/catalog/products/${form.id}` : "/api/admin/catalog/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      if (isEdit) {
        setItems((prev) =>
          prev.map((p) => (p.id === form.id ? { ...p, ...payload, price: payload.price! } : p))
        );
      } else {
        setItems((prev) => [json.product as Product, ...prev]);
      }
      setLastCommitUrl(json.commitUrl ?? null);
      setModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Remove "${product.name}" (#${product.id})? This commits to GitHub and deploys.`)) {
      return;
    }
    setDeletingId(product.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/catalog/products/${product.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      setLastCommitUrl(json.commitUrl ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {lastCommitUrl ? (
        <div className={adminUi.successBox}>
          Saved — commit pushed, deploy in progress (usually ~5 min).{" "}
          <a href={lastCommitUrl} target="_blank" rel="noopener noreferrer" className="underline">
            View commit
          </a>
          {" · "}
          <a
            href="https://github.com/drivoraparts/drivoraparts/actions"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View deploy status
          </a>
        </div>
      ) : null}

      {error ? <div className={adminUi.errorBox}>{error}</div> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, id, category, brand…"
          className={adminUi.input}
        />
        <button onClick={openAdd} className={`${adminUi.buttonPrimary} shrink-0`}>
          + Add Product
        </button>
      </div>

      <p className={adminUi.muted}>
        Showing {pageItems.length} of {filtered.length} products
        {filtered.length !== items.length ? ` (filtered from ${items.length})` : ""}
      </p>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm border border-zinc-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className={adminUi.tableHead}>
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Views</th>
              <th className="p-4">Cart Adds</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((product) => (
              <tr key={product.id} className={adminUi.tableRow}>
                <td className="p-4 text-zinc-500">{product.id}</td>
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4 text-zinc-600">{product.category}</td>
                <td className="p-4">${product.price.toFixed(2)}</td>
                <td className="p-4">
                  {product.stock === false ? (
                    <span className="text-red-600">Out of stock</span>
                  ) : (
                    <span className="text-emerald-600">In stock</span>
                  )}
                </td>
                <td className="p-4">{viewMap.get(product.id) ?? 0}</td>
                <td className="p-4">{cartMap.get(product.id) ?? 0}</td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(product)}
                      className="font-semibold text-zinc-700 hover:text-red-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product)}
                      disabled={deletingId === product.id}
                      className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deletingId === product.id ? "Removing…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`${adminUi.buttonSecondary} px-3 py-1.5`}
          >
            Prev
          </button>
          <span className={adminUi.muted}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`${adminUi.buttonSecondary} px-3 py-1.5`}
          >
            Next
          </button>
        </div>
      ) : null}

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-semibold text-zinc-900">
              {modal === "add" ? "Add Product" : `Edit #${form.id}`}
            </h2>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">Name</span>
                <input
                  className={adminUi.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-zinc-700">Category</span>
                  <select
                    className={adminUi.input}
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value, brand: "" })
                    }
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-zinc-700">Brand</span>
                  <select
                    className={adminUi.input}
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {brandOptions.map((b) => (
                      <option key={b.slug} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-zinc-700">Price ($)</span>
                  <input
                    type="number"
                    step="0.01"
                    className={adminUi.input}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-zinc-700">Stock qty</span>
                  <input
                    type="number"
                    className={adminUi.input}
                    value={form.stockQty}
                    onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.checked })}
                />
                <span className="text-sm font-medium text-zinc-700">In stock</span>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">
                  Thumbnail path or URL
                </span>
                <input
                  className={adminUi.input}
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  placeholder="/product-media/…"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">Fitment</span>
                <input
                  className={adminUi.input}
                  value={form.fitment}
                  onChange={(e) => setForm({ ...form, fitment: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">Warranty</span>
                <input
                  className={adminUi.input}
                  value={form.warranty}
                  onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">Description</span>
                <textarea
                  className={adminUi.input}
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
            </div>

            {error ? <div className={`${adminUi.errorBox} mt-4`}>{error}</div> : null}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeModal} className={adminUi.buttonSecondary}>
                Cancel
              </button>
              <button onClick={submitForm} disabled={saving} className={adminUi.buttonPrimary}>
                {saving ? "Saving…" : modal === "add" ? "Add Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
