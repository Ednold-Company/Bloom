"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => {
            // Silently handle if in restricted environment
            console.debug("ServiceWorker registration skipped or failed:", err);
          });
      });
    }
  }, []);

  return null;
}

