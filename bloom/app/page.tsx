import Link from "next/link";

export default function Home() {
  return (
    <main className="bloom-gradient min-h-screen px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-400">Bloom</p>
          <h1 className="font-display text-4xl text-[#5a2d4b] md:text-6xl">
            Gentle cycle tracking with smart predictions
          </h1>
          <p className="max-w-2xl text-lg text-[#5a2d4b]/80">
            Bloom brings clarity to your cycle. Log periods, symptoms, and mood, then receive
            AI-assisted insights for your next period, ovulation, and PMS window.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-[#ef7a9a] px-6 py-3 text-sm font-semibold text-white"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[#f0d6df] px-6 py-3 text-sm font-semibold text-[#5a2d4b]"
            >
              Sign in
            </Link>
          </div>
        </header>
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Personalized insights",
              body: "Bloom learns your patterns to refine predictions and cycle guidance.",
            },
            {
              title: "Symptom journaling",
              body: "Track mood, energy, cramps, and sleep in a few gentle taps.",
            },
            {
              title: "Calendar clarity",
              body: "Visualize fertile windows, period days, and wellness reminders.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-[#f0d6df] bg-white/80 p-6 shadow-lg shadow-pink-100"
            >
              <h3 className="font-display text-xl text-[#5a2d4b]">{card.title}</h3>
              <p className="mt-2 text-sm text-[#5a2d4b]/70">{card.body}</p>
            </div>
          ))}
        </section>
        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="rounded-3xl border border-[#f0d6df] bg-white/80 p-6 shadow-lg shadow-pink-100 fade-in">
            <h3 className="font-display text-2xl text-[#5a2d4b]">Bloom companion</h3>
            <p className="mt-2 text-sm text-[#5a2d4b]/70">
              A calm space for tracking cycles, moods, and gentle reminders. Bloom helps you feel supported every day.
            </p>
          </div>
          <div className="relative h-48 w-full floaty">
            <div className="absolute right-2 top-2 h-32 w-32 rounded-full bg-[#f2a3b5] opacity-70 blur-xl" />
            <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-[#d9f3ea] opacity-70 blur-lg" />
            <div className="absolute bottom-4 right-10 h-12 w-12 rounded-full bg-[#f1e6ff] opacity-80" />
            <div className="absolute inset-x-10 bottom-2 h-16 rounded-full bg-white/70 backdrop-blur-sm" />
          </div>
        </section>
      </div>
    </main>
  );
}
