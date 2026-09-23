"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthToken } from "@/lib/useAuthToken";
import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import { BLOOM_STICKERS } from "@/lib/stickers";
import StickerBadge from "@/components/ui/StickerBadge";

type SymptomForm = {
  date: string;
  mood?: string;
  cramps?: number;
  sleep?: number;
  energy?: number;
  notes?: string;
};

export default function SymptomsPage() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, setValue, watch, reset } = useForm<SymptomForm>({
    defaultValues: {
      date: todayIso,
      cramps: 1,
      sleep: 3,
      energy: 3,
      mood: "Radiant",
    },
  });

  const selectedMood = watch("mood");
  const selectedCramps = watch("cramps");
  const selectedSleep = watch("sleep");
  const selectedEnergy = watch("energy");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const token = useAuthToken();
  const queryClient = useQueryClient();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", token],
    queryFn: async () => {
      const response = await api.get("/symptoms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.symptoms || [];
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (values: SymptomForm) => {
      const response = await api.post("/symptoms", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.symptom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      showToast("🌸 Daily symptoms logged successfully!");
      reset({
        date: todayIso,
        cramps: 1,
        sleep: 3,
        energy: 3,
        mood: "Radiant",
      });
    },
    onError: () => {
      showToast("Unable to save symptoms. Please check your connection.");
    },
  });

  return (
    <div className="relative grid gap-6 md:grid-cols-[1.3fr_1fr] pb-12">
      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#ff5277] px-5 py-3.5 text-sm font-bold text-white shadow-xl animate-pop">
          <span>{toastMessage}</span>
        </div>
      ) : null}

      <Card
        title={
          <span className="flex items-center gap-2">
            <span className="text-xl">📝</span> Daily Symptom & Mood Journal
          </span>
        }
        subtitle="Log your body signals, mood, and wellness indicators"
      >
        <form
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          className="space-y-5 pt-2"
        >
          {/* Date picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>
              Entry Date
            </label>
            <input
              {...register("date", { required: true })}
              type="date"
              className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Mood Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
              Today's Mood & Feeling
            </label>
            <div className="flex flex-wrap gap-2">
              {BLOOM_STICKERS.map((sticker) => {
                const isSelected = selectedMood === sticker.label;
                return (
                  <StickerBadge
                    key={sticker.id}
                    sticker={sticker}
                    size="sm"
                    selected={isSelected}
                    onClick={() => setValue("mood", sticker.label)}
                  />
                );
              })}
            </div>
          </div>

          {/* Sliders / Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Cramps */}
            <div className="rounded-2xl p-3.5 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 5%, var(--card))" }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>🩸 Cramps</span>
                <span className="text-xs font-bold text-[#ff5277]">{selectedCramps ?? 1}/5</span>
              </div>
              <input
                {...register("cramps", { valueAsNumber: true })}
                type="range"
                min={1}
                max={5}
                className="w-full accent-[#ff5277]"
              />
              <p className="text-[10px] text-right mt-0.5" style={{ color: "var(--muted)" }}>
                {(selectedCramps ?? 1) === 1 ? "None / Mild" : (selectedCramps ?? 1) >= 4 ? "Severe" : "Moderate"}
              </p>
            </div>

            {/* Sleep */}
            <div className="rounded-2xl p-3.5 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--lavender-deep) 5%, var(--card))" }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>😴 Sleep</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{selectedSleep ?? 3}/5</span>
              </div>
              <input
                {...register("sleep", { valueAsNumber: true })}
                type="range"
                min={1}
                max={5}
                className="w-full accent-purple-500"
              />
              <p className="text-[10px] text-right mt-0.5" style={{ color: "var(--muted)" }}>
                {(selectedSleep ?? 3) <= 2 ? "Restless" : (selectedSleep ?? 3) >= 4 ? "Deep & Restful" : "Average"}
              </p>
            </div>

            {/* Energy */}
            <div className="rounded-2xl p-3.5 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--mint-deep) 5%, var(--card))" }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>⚡ Energy</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{selectedEnergy ?? 3}/5</span>
              </div>
              <input
                {...register("energy", { valueAsNumber: true })}
                type="range"
                min={1}
                max={5}
                className="w-full accent-emerald-500"
              />
              <p className="text-[10px] text-right mt-0.5" style={{ color: "var(--muted)" }}>
                {(selectedEnergy ?? 3) <= 2 ? "Low Battery" : (selectedEnergy ?? 3) >= 4 ? "Supercharged" : "Balanced"}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>
              Notes & Thoughts
            </label>
            <textarea
              {...register("notes")}
              placeholder="How are you feeling emotionally, physically, or cravings you noticed..."
              className="min-h-[100px] w-full rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white transition-all shadow-md active:scale-98 disabled:opacity-60"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {createMutation.isPending ? "Saving entry..." : "Save Daily Entry 🌸"}
          </button>
        </form>
      </Card>

      {/* Recent Entries History */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <span className="text-2xl">📖</span> Recent Journal Logs
          </span>
        }
        subtitle="Your recent symptom entries"
      >
        <div className="space-y-3 pt-2">
          {symptomsQuery.data?.length ? (
            symptomsQuery.data.slice(0, 8).map((symptom: any) => {
              const matchedSticker = BLOOM_STICKERS.find(
                (s) => s.label.toLowerCase() === (symptom.mood || "").toLowerCase()
              );
              return (
                <div
                  key={symptom.id}
                  className="rounded-2xl border p-3.5 space-y-1.5 transition hover:shadow-xs"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent) 4%, var(--card))",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs" style={{ color: "var(--foreground)" }}>
                      {new Date(symptom.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {symptom.mood ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
                        {matchedSticker?.emoji || "✨"} {symptom.mood}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--muted)" }}>
                    {symptom.cramps ? <span>🩸 Cramps: {symptom.cramps}/5</span> : null}
                    {symptom.sleep ? <span>😴 Sleep: {symptom.sleep}/5</span> : null}
                    {symptom.energy ? <span>⚡ Energy: {symptom.energy}/5</span> : null}
                  </div>

                  {symptom.notes ? (
                    <p className="text-xs pt-1 italic line-clamp-2" style={{ color: "var(--foreground)" }}>
                      "{symptom.notes}"
                    </p>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl p-6 text-center text-xs" style={{ color: "var(--muted)" }}>
              <span className="text-2xl block mb-2">🌷</span>
              No symptom logs yet. Choose a sticker and save your first entry!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
