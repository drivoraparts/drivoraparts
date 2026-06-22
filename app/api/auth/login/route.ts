export const runtime = 'edge';

import { handleAdminLogin } from "@/lib/auth/handle-login";

export async function POST(req: Request) {
  return handleAdminLogin(req);
}
