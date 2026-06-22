import { handleAdminLogin } from "@/lib/auth/handle-login";

export const runtime = "edge";

export async function POST(req: Request) {
  return handleAdminLogin(req);
}
