"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthToken } from "@/lib/useAuthToken";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/chat", label: "Bloom Guide" },
  { href: "/insights", label: "Insights" },
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
  const links = baseLinks;

  return (
    <div className="md:hidden">
      <div
        className="flex items-center justify-between rounded-3xl px-4 py-3 shadow-lg shadow-pink-100 backdrop-blur"
        style={{
          backgroundColor: "color-mix(in srgb, var(--card) 92%, transparent)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>
            Bloom
          </p>
          <h2 className="font-display text-lg" style={{ color: "var(--foreground)" }}>
            Menu
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-full border p-2"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-72 p-6 shadow-2xl"
            style={{ backgroundColor: "var(--card)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl" style={{ color: "var(--foreground)" }}>
                Bloom
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border px-3 py-1 text-sm font-semibold"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Close
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-3">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "border-[#ef7a9a] text-[#5a2d4b]"
                        : "border-transparent hover:border-[#f0d6df]"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? "color-mix(in srgb, var(--accent) 12%, var(--card) 88%)"
                        : "var(--card)",
                      color: "var(--foreground)",
                      borderColor: isActive ? "var(--accent)" : "transparent",
                    }}
                  >
                    {link.label}
                    {!showInsights && link.href === "/insights" ? (
                      <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted)" }}>
                        (add 2 cycles)
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
