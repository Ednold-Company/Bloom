import Link from "next/link";
import SignOutButton from "../ui/SignOutButton";
import ThemeToggle from "../ui/ThemeToggle";
import PwaInstallButton from "../pwa/PwaInstallButton";

export default function Topbar() {
  return (
    <header
      className="flex items-center justify-between rounded-3xl px-6 py-4 glass-card shadow-lg"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#ff5277]">Bloom Monolith</p>
        <h2 className="font-display text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Gentle Wellness
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <PwaInstallButton />
        <ThemeToggle />
        <Link
          href="/settings"
          className="rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition hover:scale-105"
          style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, var(--card))", color: "var(--foreground)" }}
        >
          ⚙️ Settings
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
