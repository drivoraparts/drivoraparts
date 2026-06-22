import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-white">
          Loading...
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
