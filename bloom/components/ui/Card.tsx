import { ReactNode } from "react";

export default function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section
      className="rounded-3xl border p-6 shadow-lg shadow-pink-100"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {title ? (
        <h3 className="mb-4 font-display text-lg" style={{ color: "var(--foreground)" }}>
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}
