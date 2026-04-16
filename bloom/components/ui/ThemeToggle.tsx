"use client";

import { useThemeMode } from "@/lib/theme";

export default function ThemeToggle() {
  const { resolved, toggle } = useThemeMode();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-full border border-[#f0d6df] p-2 text-[#5a2d4b]"
      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
    >
      {resolved === "dark" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v2.5M12 18.5V21M4.5 12H2M22 12h-2.5M5.5 5.5 7.3 7.3M16.7 16.7l1.8 1.8M18.5 5.5 16.7 7.3M7.3 16.7l-1.8 1.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )}
    </button>
  );
}
