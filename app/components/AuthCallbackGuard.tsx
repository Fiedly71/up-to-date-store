"use client";
import { useLayoutEffect } from "react";

export default function AuthCallbackGuard() {
  useLayoutEffect(() => {
    const hash = window.location.hash;
    if (hash && window.location.pathname !== "/auth") {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get("type");
      if (type === "recovery" || type === "invite") {
        window.location.replace("/auth" + hash);
      }
    }
  }, []);
  return null;
}
