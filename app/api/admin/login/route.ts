import { handleAdminLogin } from "@/lib/auth/handle-login";

/** @deprecated Use POST /api/auth/login */
export async function POST(req: Request) {
  return handleAdminLogin(req);
}
