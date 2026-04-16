"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthToken } from "@/lib/useAuthToken";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/chat", label: "Bloom Guide ( AI )" },
  { href: "/insights", label: "Insights" },
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
  const allLinks = links;
  return (
    <aside
      className="hidden md:flex w-64 flex-col gap-6 rounded-3xl p-6 shadow-lg shadow-pink-100 lg:sticky lg:top-10 lg:self-start"
      style={{ backgroundColor: "var(--card)" }}
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Bloom</p>
        <h1 className="font-display text-2xl" style={{ color: "var(--foreground)" }}>
          Your Cycle
        </h1>
      </div>
      <nav className="flex flex-col gap-3">
        {allLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              isActive
                ? "shadow-md shadow-pink-100"
                : ""
            }`}
            style={{
              borderColor: isActive ? "var(--accent)" : "transparent",
              backgroundColor: isActive ? "var(--background)" : "color-mix(in srgb, var(--accent) 6%, var(--card))",
              color: "var(--foreground)",
            }}
          >
            {link.label}
            {!showInsights && link.href === "/insights" ? (
              <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted)" }}>
                (add 2 cycles)
              </span>
            ) : null}
          </Link>
        );})}
      </nav>
      <div
        className="mt-auto rounded-2xl p-4 text-sm"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, var(--card))", color: "var(--foreground)" }}
      >
        Track daily, and Bloom will refine your predictions over time.
      </div>
    </aside>
  );
}
