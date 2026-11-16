"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("yobbugo_role");
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className={`text-sm hover:underline ${className}`}
    >
      Déconnexion
    </button>
  );
}
