import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

function LoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-600">
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
