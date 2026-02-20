"use client";
import { useLayoutEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false } }
);

export default function AuthCallbackGuard() {
  useLayoutEffect(() => {
    const hash = window.location.hash;
    if (hash && window.location.pathname !== "/auth") {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get("type");
      if (type === "recovery" || type === "invite") {
        window.location.replace("/auth" + hash);
        return;
      }
    }

    // If user left /auth without completing password reset, sign them out
    if (window.location.pathname !== "/auth") {
      const pending = sessionStorage.getItem("pendingPasswordReset");
      if (pending) {
        sessionStorage.removeItem("pendingPasswordReset");
        supabase.auth.signOut().then(() => {
          window.location.replace("/auth");
        });
      }
    }
  }, []);
  return null;
}
