import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

function LoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] text-zinc-400">
      Loading sign in...
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
