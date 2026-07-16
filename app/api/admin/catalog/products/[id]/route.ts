import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";
import { validateProductInput } from "@/lib/admin/validate-product";
import {
  upsertOverride,
  softDeleteProduct,
  GithubCatalogError,
} from "@/lib/admin/github-catalog";
import { getProductById } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const existing = getProductById(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const ip = getClientIp(req);
  const body = (await req.json().catch(() => null)) as Partial<Product> | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const errors = validateProductInput(body);
  if (errors.length) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  try {
    const { commitUrl } = await upsertOverride(
      id,
      body,
      `Edit product #${id}: ${existing.name} (via admin dashboard)`
    );

    await logAdminAudit(auth.session?.email, "catalog.product_edit", String(id), {
      ip,
      fields: Object.keys(body),
    });
    await logActivity("info", "catalog.product_edited", {
      id,
      admin: auth.session?.email,
      ip,
      fields: Object.keys(body),
    });

    return NextResponse.json({ ok: true, commitUrl });
  } catch (error) {
    await logActivity("error", "catalog.product_edit_failed", {
      id,
      admin: auth.session?.email,
      ip,
      message: error instanceof Error ? error.message : "unknown error",
    });
    const status = error instanceof GithubCatalogError ? 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to edit product" },
      { status }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const existing = getProductById(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const ip = getClientIp(req);

  try {
    const { commitUrl } = await softDeleteProduct(
      id,
      `Remove product #${id}: ${existing.name} (via admin dashboard)`
    );

    await logAdminAudit(auth.session?.email, "catalog.product_delete", String(id), {
      ip,
      name: existing.name,
    });
    await logActivity("warn", "catalog.product_deleted", {
      id,
      name: existing.name,
      admin: auth.session?.email,
      ip,
    });

    return NextResponse.json({ ok: true, commitUrl });
  } catch (error) {
    await logActivity("error", "catalog.product_delete_failed", {
      id,
      admin: auth.session?.email,
      ip,
      message: error instanceof Error ? error.message : "unknown error",
    });
    const status = error instanceof GithubCatalogError ? 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status }
    );
  }
}
