"use client";

import BloomChatbot from "@/components/chatbot/BloomChatbot";
import Card from "@/components/ui/Card";

export default function ChatPage() {
  const handleQuickPrompt = (prompt: string) => {
    const inputEl = document.querySelector<HTMLInputElement>(".react-chatbot-kit-chat-input");
    const formEl = document.querySelector<HTMLFormElement>(".react-chatbot-kit-chat-input-form");
    if (inputEl) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(inputEl, prompt);
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      if (formEl) {
        setTimeout(() => {
          formEl.requestSubmit();
        }, 50);
      }
    }
  };

  const quickPrompts = [
    { label: "🛡️ When is my next free period?", prompt: "When is my next free period?" },
    { label: "🌸 Can I have unprotected sex today?", prompt: "Can I have unprotected sex today?" },
    { label: "🩸 When is my next period due?", prompt: "When will my next period start?" },
    { label: "🌺 When is my ovulation peak?", prompt: "When is my ovulation peak?" },
    { label: "🧸 How to relieve cramps quickly?", prompt: "How can I relieve bad cramps?" },
    { label: "🥑 What should I eat for my phase?", prompt: "What foods should I eat in my current phase?" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] pb-12">
      <div className="glass-card rounded-3xl p-4 md:p-6 shadow-xl space-y-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <div>
              <h2 className="font-display text-lg font-bold" style={{ color: "var(--foreground)" }}>
                Bloom AI Wellness Assistant
              </h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Empathetic, science-grounded menstrual & safe sex guidance
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online
          </span>
        </div>

        {/* Quick 1-Tap Prompt Chips */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {quickPrompts.map((item) => (
            <button
              key={item.prompt}
              type="button"
              onClick={() => handleQuickPrompt(item.prompt)}
              className="rounded-xl px-2.5 py-1 text-[11px] font-bold border transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-2xs"
              style={{
                backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--card))",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <BloomChatbot />
      </div>

      <div className="space-y-6">
        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-xl">🌸</span> What Bloom AI Can Do
            </span>
          }
          subtitle="Tap any card to ask immediately"
        >
          <div className="space-y-3 pt-2 text-xs md:text-sm" style={{ color: "var(--foreground)" }}>
            <button
              type="button"
              onClick={() => handleQuickPrompt("When is my next free period and safe sex days?")}
              className="w-full text-left rounded-2xl border p-3.5 transition hover:scale-101 cursor-pointer"
              style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 5%, var(--card))" }}
            >
              <p className="font-bold text-[#ff5277]">🛡️ Safe Sex & Free Period Guidance</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                "When is my next free period?" • "Is today safe for sex?" • "When am I fertile?"
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPrompt("When will my next period start?")}
              className="w-full text-left rounded-2xl border p-3.5 transition hover:scale-101 cursor-pointer"
              style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--lavender-deep) 5%, var(--card))" }}
            >
              <p className="font-bold text-purple-600 dark:text-purple-400">🩸 Period & Cycle Timing</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                "When will my next period start?" • "Why is my period late?" • "What phase am I in?"
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPrompt("How do I relieve bad cramps and bloating?")}
              className="w-full text-left rounded-2xl border p-3.5 transition hover:scale-101 cursor-pointer"
              style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--mint-deep) 5%, var(--card))" }}
            >
              <p className="font-bold text-emerald-600 dark:text-emerald-400">🧸 Cramps & PMS Relief</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                "How to relieve bad cramps fast?" • "What teas help with bloating and mood swings?"
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPrompt("What foods and seeds should I eat in this phase?")}
              className="w-full text-left rounded-2xl border p-3.5 transition hover:scale-101 cursor-pointer"
              style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--gold-deep) 5%, var(--card))" }}
            >
              <p className="font-bold text-amber-600 dark:text-amber-400">🥑 Nutrition & Seed Cycling</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                "What foods should I eat in the luteal phase?" • "What is seed cycling?"
              </p>
            </button>
          </div>
        </Card>

        <Card title="🔒 Complete Privacy">
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            Your conversation and health logs stay strictly private. Chat logs are automatically pruned after 30 days.
          </p>
        </Card>
      </div>
    </div>
  );
}
