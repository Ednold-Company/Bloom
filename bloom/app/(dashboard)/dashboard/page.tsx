"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import api from "@/lib/api";
import { useAuthToken } from "@/lib/useAuthToken";
import Link from "next/link";

type Cycle = { id: string; startDate: string };

function buildPrediction(cycles: Cycle[]) {
  if (cycles.length < 2) return null;
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    lengths.push(
      Math.round(
        (new Date(sorted[i].startDate).getTime() - new Date(sorted[i - 1].startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }
  const averageCycleLength = Math.round(lengths.reduce((sum, value) => sum + value, 0) / lengths.length);
  const lastStart = new Date(sorted[sorted.length - 1].startDate);
  const nextPeriodStart = new Date(lastStart.getTime() + averageCycleLength * 24 * 60 * 60 * 1000);
  const ovulationDate = new Date(nextPeriodStart.getTime() - 14 * 24 * 60 * 60 * 1000);
  const pmsStart = new Date(nextPeriodStart.getTime() - 5 * 24 * 60 * 60 * 1000);
  return { nextPeriodStart, ovulationDate, pmsStart, averageCycleLength };
}

export default function DashboardPage() {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [showGuideTip, setShowGuideTip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setIsMounted(true);
      const seen = localStorage.getItem("bloom_seen_guide_tip");
      setShowGuideTip(!seen);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const predictionsQuery = useQuery({
    queryKey: ["predictions", token],
    queryFn: async () => {
      const response = await api.get("/predictions/next", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

  const cyclesQuery = useQuery({
    queryKey: ["cycles", token],
    queryFn: async () => {
      const response = await api.get("/cycles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.cycles as Cycle[];
    },
    enabled: !!token,
  });

  const cyclePrediction = predictionsQuery.data?.cyclePrediction as
    | {
        nextPeriodStart: string;
        ovulationDate: string;
        pmsStart: string;
        averageCycleLength: number;
      }
    | null
    | undefined;
  const fallbackPrediction = cyclesQuery.data ? buildPrediction(cyclesQuery.data) : null;
  const effectivePrediction = cyclePrediction
    ? {
        nextPeriodStart: new Date(cyclePrediction.nextPeriodStart),
        ovulationDate: new Date(cyclePrediction.ovulationDate),
        pmsStart: new Date(cyclePrediction.pmsStart),
        averageCycleLength: cyclePrediction.averageCycleLength,
      }
    : fallbackPrediction;
  const today = new Date().toISOString().slice(0, 10);

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", token],
    queryFn: async () => {
      const response = await api.get("/symptoms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.symptoms as Array<{ id: string }>;
    },
    enabled: !!token,
  });

  const hasAnySymptoms = (symptomsQuery.data?.length ?? 0) > 0;

  const quickLog = useMutation({
    mutationFn: async () => {
      await api.post(
        "/cycles",
        { startDate: today },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
    },
  });

  return (
    <div className="relative grid gap-6 md:grid-cols-2">
      <div className="pointer-events-none absolute -top-6 right-4 hidden h-52 w-52 rounded-full bg-[#f1e6ff] opacity-50 blur-3xl lg:block" />
      <div className="pointer-events-none absolute left-4 top-32 hidden h-24 w-24 rounded-full bg-[#ffd4c1] opacity-60 blur-2xl lg:block" />
      {isMounted && showGuideTip ? (
        <Card title="New here? Start with the Guide">
          <p className="text-sm text-[#5a2d4b]/70">
            Visit Bloom Guide for a quick tour on how to log cycles, symptoms, and get predictions.
          </p>
          <button
            className="mt-3 rounded-2xl bg-[#ef7a9a] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              localStorage.setItem("bloom_seen_guide_tip", "true");
              window.location.href = "/chat";
            }}
          >
            Go to Bloom Guide
          </button>
        </Card>
      ) : null}
      <Card title="Next cycle forecast">
        <p className="text-sm text-[#5a2d4b]/70">
          {effectivePrediction
            ? `Next period: ${effectivePrediction.nextPeriodStart.toDateString()}`
            : "Not enough data yet. Log at least two cycles to see predictions."}
        </p>
        <div className="mt-4 grid gap-3 text-sm text-[#5a2d4b]/70">
          <p>
            Ovulation window:{" "}
            {effectivePrediction
              ? `${new Date(
                  effectivePrediction.ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000
                ).toDateString()} ? ${effectivePrediction.ovulationDate.toDateString()}`
              : "-"}
          </p>
          <p>
            PMS likely starts: {effectivePrediction ? effectivePrediction.pmsStart.toDateString() : "-"}
          </p>
        </div>
      </Card>
      <Card title="How Bloom learns">
        <p className="text-sm text-[#5a2d4b]/70">
          Bloom looks at your past cycle lengths and symptom patterns. The more you log, the better the
          predictions.
        </p>
      </Card>
      <Card title="Quick log">
        <div className="flex flex-col gap-3">
          <button
            className="rounded-2xl bg-[#ef7a9a] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            onClick={() => quickLog.mutate()}
            disabled={!token || quickLog.isPending || !hasAnySymptoms}
          >
            {quickLog.isPending ? "Logging..." : "Log period start (today)"}
          </button>
          {!hasAnySymptoms ? (
            <p className="text-xs text-[#5a2d4b]/70">
              Log at least one symptom before starting a period entry.
            </p>
          ) : null}
          <Link
            href="/symptoms"
            className="rounded-2xl border border-[#f0d6df] px-4 py-3 text-center text-sm font-semibold text-[#5a2d4b]"
          >
            Log symptoms
          </Link>
        </div>
      </Card>
      <Card title="Notifications">
        <p className="text-sm text-[#5a2d4b]/70">
          Get gentle reminders for period start, fertility window, and wellness check-ins.
        </p>
      </Card>
    </div>
  );
}
