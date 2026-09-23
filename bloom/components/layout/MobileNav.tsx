"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthToken } from "@/lib/useAuthToken";
import PwaInstallButton from "../pwa/PwaInstallButton";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "🌸" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/symptoms", label: "Symptoms & Vibe", icon: "✨" },
  { href: "/chat", label: "Bloom AI Guide", icon: "💬" },
  { href: "/insights", label: "Insights & Charts", icon: "📈" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const token = useAuthToken();

  const cyclesQuery = useQuery({
    queryKey: ["cycles", token],
    queryFn: async () => {
      const response = await api.get("/cycles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.cycles as Array<{ id: string }>;
    },
    enabled: !!token,
  });

  const showInsights = (cyclesQuery.data?.length ?? 0) >= 2;

  return (
    <div className="md:hidden">
      <div
        className="flex items-center justify-between rounded-3xl px-4 py-3 glass-card shadow-md"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#ff5277]">Bloom</p>
            <h2 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>
              Menu
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PwaInstallButton />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-full border p-2 cursor-pointer active:scale-95"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card))" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 animate-pop">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-72 p-6 shadow-2xl glass-card flex flex-col justify-between"
            style={{ backgroundColor: "var(--card)" }}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌸</span>
                  <h3 className="font-display text-xl font-bold text-[#ff5277]">
                    Bloom
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border px-3 py-1 text-xs font-bold"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  ✕ Close
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-2.5">
                {baseLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                        isActive
                          ? "scale-102 shadow-md"
                          : "opacity-85"
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? "color-mix(in srgb, var(--accent) 15%, var(--card))"
                          : "color-mix(in srgb, var(--accent) 5%, var(--card))",
                        color: isActive ? "var(--accent)" : "var(--foreground)",
                        borderColor: isActive ? "var(--accent)" : "transparent",
                      }}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                      {!showInsights && link.href === "/insights" ? (
                        <span className="ml-auto text-[10px] font-normal" style={{ color: "var(--muted)" }}>
                          (2+ cycles)
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div
              className="rounded-2xl p-4 text-xs border"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card))",
                color: "var(--foreground)",
              }}
            >
              <p className="font-bold text-[#ff5277]">💖 Bloom Monolith</p>
              <p className="mt-1" style={{ color: "var(--muted)" }}>Gentle cycle tracking and supportive AI companion.</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
