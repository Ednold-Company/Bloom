import Link from "next/link";
import SignOutButton from "../ui/SignOutButton";
import ThemeToggle from "../ui/ThemeToggle";

export default function Topbar() {
  return (
    <header
      className="flex items-center justify-between rounded-3xl px-6 py-4 shadow-lg shadow-pink-100"
      style={{ backgroundColor: "var(--card)" }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Bloom</p>
        <h2 className="font-display text-xl" style={{ color: "var(--foreground)" }}>
          Welcome back
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/settings"
          className="rounded-full px-4 py-2 text-sm font-semibold"
          style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, var(--card))", color: "var(--foreground)" }}
        >
          Settings
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
