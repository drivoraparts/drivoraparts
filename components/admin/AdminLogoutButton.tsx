"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUi } from "./admin-ui";

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
      className={adminUi.buttonSecondary}
    >
      {loading ? "..." : "Logout"}
    </button>
  );
}
