"use client";

import Card from "@/components/ui/Card";
import PwaInstallButton from "@/components/pwa/PwaInstallButton";

export default function SettingsPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 pb-12">
      <Card
        title={
          <span className="flex items-center gap-2">
            <span className="text-xl">🔔</span> Notification Preferences
          </span>
        }
        subtitle="Manage gentle reminders for your cycle"
      >
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          Bloom can deliver gentle reminders for period start, ovulation peak, and daily symptom journaling.
        </p>
        <div className="mt-4 flex flex-col gap-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          {[
            { id: "p1", label: "🌸 Period start reminders (1 day before)" },
            { id: "p2", label: "🌺 Fertile window & ovulation reminders" },
            { id: "p3", label: "🛡️ Safe sex days transition alerts" },
            { id: "p4", label: "✨ Daily mood & sticker check-in reminder" },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded-md accent-[#ff5277]" />
              <span className="text-xs md:text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <span className="text-xl">📲</span> Progressive Web App (PWA)
          </span>
        }
        subtitle="Install Bloom directly onto your mobile or desktop"
      >
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          Install Bloom as a native-feeling app directly from your browser. It launches full-screen without URL bars and caches offline.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 6%, var(--card))" }}>
          <div>
            <p className="font-bold text-xs" style={{ color: "var(--foreground)" }}>Home Screen App</p>
            <p className="text-[11px]" style={{ color: "var(--muted)" }}>Fast 1-tap launch anytime</p>
          </div>
          <PwaInstallButton />
        </div>
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <span className="text-xl">🔒</span> Privacy & Data Control
          </span>
        }
        subtitle="Your intimate health data is yours alone"
      >
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          Bloom operates with client-side token isolation and supports anonymous mode. Chat logs with Bloom AI Guide are automatically pruned after 30 days.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                const data = {
                  token: localStorage.getItem("bloom_anon_token") || "session",
                  exportedAt: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `bloom-data-export-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }
            }}
            className="rounded-2xl border px-4 py-2.5 text-xs font-bold transition hover:scale-102 cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)" }}
          >
            📥 Export My Data (JSON)
          </button>
        </div>
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <span className="text-xl">🌸</span> About Bloom Monolith
          </span>
        }
        subtitle="Architecture & Model Info"
      >
        <div className="space-y-2 text-xs" style={{ color: "var(--muted)" }}>
          <p>• <strong>Version</strong>: 2.0.0 (Next.js Monolith & PWA)</p>
          <p>• <strong>AI Engine</strong>: Rule & Statistical Menstrual Predictor + Bloom Guide</p>
          <p>• <strong>Privacy</strong>: Zero tracking, local token authorization</p>
        </div>
      </Card>
    </div>
  );
}
