import { getGithubRepo, getGithubToken } from "@/lib/env";
import type { Product } from "@/lib/inventory/types";

const API_BASE = "https://api.github.com";

const OVERRIDES_PATH = "lib/inventory/data/admin-catalog-overrides.json";
const ADDED_PATH = "lib/inventory/data/admin-added-products.json";

export class GithubCatalogError extends Error {}

function authHeaders(): Record<string, string> {
  const token = getGithubToken();
  if (!token) {
    throw new GithubCatalogError(
      "GITHUB_TOKEN is not configured — set it as a server secret before using catalog editing."
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "drivoraparts-admin",
  };
}

async function readJsonFile<T>(path: string): Promise<{ data: T; sha: string }> {
  const repo = getGithubRepo();
  const res = await fetch(
    `${API_BASE}/repos/${repo}/contents/${encodeURIComponent(path)}`,
    { headers: authHeaders(), cache: "no-store" }
  );
  if (!res.ok) {
    throw new GithubCatalogError(
      `Failed to read ${path} from GitHub: ${res.status} ${await res.text()}`
    );
  }
  const json = (await res.json()) as { content: string; sha: string };
  const decoded = Buffer.from(json.content, "base64").toString("utf8");
  return { data: JSON.parse(decoded) as T, sha: json.sha };
}

async function writeJsonFile(
  path: string,
  data: unknown,
  sha: string,
  message: string
): Promise<{ commitUrl: string }> {
  const repo = getGithubRepo();
  const content = Buffer.from(JSON.stringify(data, null, 2) + "\n", "utf8").toString(
    "base64"
  );
  const res = await fetch(
    `${API_BASE}/repos/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ message, content, sha, branch: "main" }),
    }
  );
  if (!res.ok) {
    throw new GithubCatalogError(
      `Failed to write ${path} to GitHub: ${res.status} ${await res.text()}`
    );
  }
  const json = (await res.json()) as { commit: { html_url: string } };
  return { commitUrl: json.commit.html_url };
}

type AdminOverride = Partial<Product> & { _deleted?: boolean };

/** Optional string fields where the admin form sends "" to mean "clear
 *  this override", not "set it to a blank string". */
const CLEARABLE_STRING_FIELDS = [
  "description",
  "thumbnail",
  "warranty",
  "fitment",
] as const satisfies readonly (keyof Product)[];

export async function upsertOverride(
  id: number,
  patch: Partial<Product>,
  commitMessage: string
): Promise<{ commitUrl: string }> {
  const { data, sha } = await readJsonFile<Record<string, AdminOverride>>(
    OVERRIDES_PATH
  );

  const merged: AdminOverride = { ...data[String(id)], ...patch };
  for (const field of CLEARABLE_STRING_FIELDS) {
    if (merged[field] === "") {
      delete merged[field];
    }
  }

  data[String(id)] = merged;
  return writeJsonFile(OVERRIDES_PATH, data, sha, commitMessage);
}

export async function softDeleteProduct(
  id: number,
  commitMessage: string
): Promise<{ commitUrl: string }> {
  // If this id was created via the dashboard, remove it outright instead of
  // leaving an orphaned override entry pointing at nothing.
  const { data: added, sha: addedSha } = await readJsonFile<Product[]>(
    ADDED_PATH
  );
  const wasAdminAdded = added.some((p) => p.id === id);
  if (wasAdminAdded) {
    const next = added.filter((p) => p.id !== id);
    return writeJsonFile(ADDED_PATH, next, addedSha, commitMessage);
  }

  const { data, sha } = await readJsonFile<Record<string, AdminOverride>>(
    OVERRIDES_PATH
  );
  data[String(id)] = { _deleted: true };
  return writeJsonFile(OVERRIDES_PATH, data, sha, commitMessage);
}

/**
 * Assigns the id from the same read used for the write (not a separate
 * earlier read, like the caller used to do) so two near-simultaneous
 * "Add Product" submissions can't both compute the same next id — the
 * second one now sees the first product already in `data` and picks the
 * id after it.
 */
export async function addProduct(
  productWithoutId: Omit<Product, "id">,
  deployedMaxId: number,
  commitMessage: string
): Promise<{ commitUrl: string; product: Product }> {
  const { data, sha } = await readJsonFile<Product[]>(ADDED_PATH);
  const pendingMaxId = Math.max(0, ...data.map((p) => p.id));
  const id = Math.max(deployedMaxId, pendingMaxId) + 1;
  const product: Product = { ...productWithoutId, id };
  data.push(product);
  const { commitUrl } = await writeJsonFile(ADDED_PATH, data, sha, commitMessage);
  return { commitUrl, product };
}

/** Read-only fetch of both overlay files, used to compute a safe next id. */
export async function readAdminCatalogState(): Promise<{
  overrides: Record<string, AdminOverride>;
  added: Product[];
}> {
  const [overrides, added] = await Promise.all([
    readJsonFile<Record<string, AdminOverride>>(OVERRIDES_PATH),
    readJsonFile<Product[]>(ADDED_PATH),
  ]);
  return { overrides: overrides.data, added: added.data };
}
