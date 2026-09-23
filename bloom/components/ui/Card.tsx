import { ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, subtitle, badge, children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-3xl border p-6 glass-card transition-all duration-300 ${className}`}
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {title || badge ? (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            {typeof title === "string" ? (
              <h3 className="font-display text-lg font-bold" style={{ color: "var(--foreground)" }}>
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle ? (
              <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {badge ? <div>{badge}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
