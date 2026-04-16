"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";


type SignupForm = { email: string; password: string };

export default function SignupPage() {
  const { register, handleSubmit } = useForm<SignupForm>();
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (values: SignupForm) => {
    setMessage(null);
    await api.post("/auth/register", values);
    setMessage("Account created. Please sign in.");
  };

  return (
    <main className="bloom-gradient min-h-screen px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-10 rounded-3xl p-10 shadow-lg shadow-pink-100 md:grid-cols-2"
           style={{ backgroundColor: "color-mix(in srgb, var(--card) 92%, transparent)" }}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--accent)" }}>
              Bloom
            </p>
            <ThemeToggle />
          </div>
          <h1 className="font-display text-3xl" style={{ color: "var(--foreground)" }}>
            Create your account
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Start tracking your cycle and symptoms in minutes.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("email", { required: true })}
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
          />
          <input
            {...register("password", { required: true })}
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
          />
          {message ? <p className="text-sm" style={{ color: "var(--muted)" }}>{message}</p> : null}
          <button
            type="submit"
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Create account
          </button>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--accent)" }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
