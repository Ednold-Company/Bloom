"use client";

import { useEffect, useState } from "react";

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("To install Bloom on your device: \n• On iPhone/Safari: Tap 'Share' then 'Add to Home Screen'\n• On Android/Chrome: Tap the 3 dots menu and select 'Install app'");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  if (isInstalled) return null;

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
      style={{
        backgroundColor: "color-mix(in srgb, var(--accent) 18%, var(--card))",
        color: "var(--accent)",
        borderColor: "var(--border)",
        borderWidth: "1px",
      }}
      title="Install Bloom as an app on your device"
    >
      <span>📲</span>
      <span>Install App</span>
    </button>
  );
}
