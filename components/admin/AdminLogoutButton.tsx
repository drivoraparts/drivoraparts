"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-red-500/40 hover:text-white disabled:opacity-60"
    >
      {loading ? "..." : "Logout"}
    </button>
  );
}
