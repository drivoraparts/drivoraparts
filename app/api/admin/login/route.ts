import { handleAdminLogin } from "@/lib/auth/handle-login";

export const runtime = "edge";

/** @deprecated Use POST /api/auth/login */
export async function POST(req: Request) {
  return handleAdminLogin(req);
}
