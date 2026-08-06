import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";
import { validateProductInput } from "@/lib/admin/validate-product";
import { addProduct, GithubCatalogError } from "@/lib/admin/github-catalog";
import { getAllProducts } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const ip = getClientIp(req);
  const body = (await req.json().catch(() => null)) as Partial<Product> | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const errors = validateProductInput(body, { requireCore: true });
  if (errors.length) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  try {
    const deployedMaxId = Math.max(0, ...getAllProducts().map((p) => p.id));

    const productWithoutId: Omit<Product, "id"> = {
      name: body.name!.trim(),
      category: body.category!,
      brand: body.brand!,
      price: body.price!,
      stock: body.stock ?? true,
      stockQty: body.stockQty,
      condition: body.condition ?? "brand-new",
      location: body.location,
      description: body.description,
      thumbnail: body.thumbnail,
      image: body.thumbnail ?? body.image,
      images: body.images?.length ? body.images : body.thumbnail ? [body.thumbnail] : undefined,
      warranty: body.warranty,
      fitment: body.fitment,
      partNumber: body.partNumber,
      createdAt: Date.now(),
    };

    const { commitUrl, product } = await addProduct(
      productWithoutId,
      deployedMaxId,
      `Add product: ${productWithoutId.name} (via admin dashboard)`
    );

    await logAdminAudit(auth.session?.email, "catalog.product_create", String(product.id), {
      ip,
      name: product.name,
    });
    await logActivity("info", "catalog.product_created", {
      id: product.id,
      name: product.name,
      admin: auth.session?.email,
      ip,
    });

    return NextResponse.json({ ok: true, product, commitUrl });
  } catch (error) {
    await logActivity("error", "catalog.product_create_failed", {
      admin: auth.session?.email,
      ip,
      message: error instanceof Error ? error.message : "unknown error",
    });
    const status = error instanceof GithubCatalogError ? 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status }
    );
  }
}
