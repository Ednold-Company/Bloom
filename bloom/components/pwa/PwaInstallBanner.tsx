"use client";

import { useEffect, useState } from "react";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check standalone mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <div
        className="relative overflow-hidden rounded-3xl border p-4 md:p-6 shadow-md transition-all glass-card"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card))",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff5277] text-white text-2xl shadow-md shrink-0">
              📲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base md:text-lg" style={{ color: "var(--foreground)" }}>
                  Install Bloom App (PWA)
                </h3>
                <span className="rounded-full bg-[#ff5277] px-2 py-0.5 text-[10px] font-extrabold text-white">
                  Fast & Offline
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Add Bloom to your Home Screen for full-screen mode, offline tracking, and 1-tap launch.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-2 rounded-2xl px-5 py-3 text-xs md:text-sm font-bold text-white transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <span>📲</span>
            <span>Install Bloom Now</span>
          </button>
        </div>
      </div>

      {/* Instructions Modal for Safari & Browsers */}
      {showInstructions ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-pop">
          <div
            className="w-full max-w-md rounded-3xl border p-6 shadow-2xl glass-card space-y-4"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📲</span>
                <h3 className="font-display text-lg font-bold" style={{ color: "var(--foreground)" }}>
                  Install Bloom App
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className="rounded-full border px-3 py-1 text-xs font-bold cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                ✕ Close
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs md:text-sm" style={{ color: "var(--foreground)" }}>
                <p className="font-semibold text-[#ff5277]">How to install on iPhone & iPad (Safari):</p>
                <div className="space-y-2 rounded-2xl p-3 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 5%, var(--card))" }}>
                  <p>1️⃣ Tap the <strong>Share</strong> button (square with arrow up at the bottom of Safari).</p>
                  <p>2️⃣ Scroll down and tap <strong>"Add to Home Screen"</strong> (➕).</p>
                  <p>3️⃣ Tap <strong>Add</strong> in the top-right corner.</p>
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Bloom will appear on your home screen with its cute icon and launch full-screen!
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs md:text-sm" style={{ color: "var(--foreground)" }}>
                <p className="font-semibold text-[#ff5277]">How to install on Android & Chrome:</p>
                <div className="space-y-2 rounded-2xl p-3 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 5%, var(--card))" }}>
                  <p>1️⃣ Tap the <strong>three dots (⋮)</strong> in Chrome's top-right corner.</p>
                  <p>2️⃣ Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                  <p>3️⃣ Confirm the installation.</p>
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Bloom installs directly as a standalone app with full offline support!
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="w-full rounded-2xl py-3 text-sm font-bold text-white shadow-md cursor-pointer"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Got it, thanks! 🌸
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

