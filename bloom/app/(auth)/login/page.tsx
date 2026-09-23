"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import api from "@/lib/api";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

type LoginForm = { email: string; password: string };

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginForm>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonLoading, setIsAnonLoading] = useState(false);

  const onSubmit = async (values: LoginForm) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      } else if (result?.ok) {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setError(null);
    setIsAnonLoading(true);
    try {
      const response = await api.post("/auth/anonymous");
      if (response.data?.token) {
        localStorage.setItem("bloom_anon_token", response.data.token);
        window.location.href = "/dashboard";
      } else {
        setError("Failed to create anonymous session. Please try again.");
      }
    } catch (err: any) {
      console.error("Anonymous login error:", err);
      const serverMsg = err?.response?.data?.error;
      setError(serverMsg || "Unable to connect to the server. Please check that the server is running and try again.");
    } finally {
      setIsAnonLoading(false);
    }
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
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Sign in to keep tracking your cycle and update your predictions.
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
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={isLoading || isAnonLoading}
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
          <button
            type="button"
            disabled={isLoading || isAnonLoading}
            onClick={handleAnonymous}
            className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {isAnonLoading ? "Connecting anonymously..." : "Continue anonymously"}
          </button>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            New here?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: "var(--accent)" }}>
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
