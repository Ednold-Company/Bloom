"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthToken } from "@/lib/useAuthToken";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "🌸" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/symptoms", label: "Symptoms & Vibe", icon: "✨" },
  { href: "/chat", label: "Bloom AI Guide", icon: "💬" },
  { href: "/insights", label: "Insights & Charts", icon: "📈" },
];

export default function Sidebar() {
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
    <aside
      className="hidden md:flex w-64 flex-col gap-6 rounded-3xl p-6 glass-card lg:sticky lg:top-8 lg:self-start shrink-0 shadow-lg"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <p className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#ff5277]">Bloom</p>
        </div>
        <h1 className="font-display text-2xl font-black" style={{ color: "var(--foreground)" }}>
          Your Cycle
        </h1>
      </div>

      <nav className="flex flex-col gap-2.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                isActive
                  ? "shadow-md shadow-pink-500/15 scale-[1.02]"
                  : "hover:scale-[1.01] opacity-85 hover:opacity-100"
              }`}
              style={{
                borderColor: isActive ? "var(--accent)" : "transparent",
                backgroundColor: isActive
                  ? "color-mix(in srgb, var(--accent) 15%, var(--card))"
                  : "color-mix(in srgb, var(--accent) 5%, var(--card))",
                color: isActive ? "var(--accent)" : "var(--foreground)",
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

      <div
        className="mt-auto rounded-2xl p-4 text-xs leading-relaxed border"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card))",
          color: "var(--foreground)",
        }}
      >
        <span className="font-bold text-[#ff5277]">💖 Bloom Tip:</span> Track daily, and our AI learns your body's unique rhythm.
      </div>
    </aside>
  );
}
