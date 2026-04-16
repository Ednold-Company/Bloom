"use client";

import { useForm } from "react-hook-form";
import { useAuthToken } from "@/lib/useAuthToken";
import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "@/components/ui/Card";

type SymptomForm = {
  date: string;
  mood?: string;
  cramps?: number;
  sleep?: number;
  energy?: number;
  notes?: string;
};

export default function SymptomsPage() {
  const { register, handleSubmit, reset } = useForm<SymptomForm>();
  const token = useAuthToken();
  const queryClient = useQueryClient();

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", token],
    queryFn: async () => {
      const response = await api.get("/symptoms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.symptoms;
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
      reset();
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <Card title="Log symptoms">
        <form
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          className="grid gap-4"
        >
          <input
            {...register("date", { required: true })}
            type="date"
            className="w-full rounded-2xl border border-[#f0d6df] px-4 py-3 text-sm"
          />
          <input
            {...register("mood")}
            type="text"
            placeholder="Mood"
            className="w-full rounded-2xl border border-[#f0d6df] px-4 py-3 text-sm"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <input
              {...register("cramps", { valueAsNumber: true })}
              type="number"
              min={1}
              max={5}
              placeholder="Cramps (1-5)"
              className="w-full rounded-2xl border border-[#f0d6df] px-4 py-3 text-sm"
            />
            <input
              {...register("sleep", { valueAsNumber: true })}
              type="number"
              min={1}
              max={5}
              placeholder="Sleep (1-5)"
              className="w-full rounded-2xl border border-[#f0d6df] px-4 py-3 text-sm"
            />
            <input
              {...register("energy", { valueAsNumber: true })}
              type="number"
              min={1}
              max={5}
              placeholder="Energy (1-5)"
              className="w-full rounded-2xl border border-[#f0d6df] px-4 py-3 text-sm"
            />
          </div>
          <textarea
            {...register("notes")}
            placeholder="Notes"
            className="min-h-[120px] w-full rounded-2xl border border-[#f0d6df] px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#ef7a9a] px-4 py-3 text-sm font-semibold text-white"
          >
            Save symptoms
          </button>
        </form>
      </Card>
      <Card title="Recent entries">
        <div className="space-y-3 text-sm text-[#5a2d4b]/70">
          {symptomsQuery.data?.length ? (
            symptomsQuery.data.slice(0, 5).map((symptom: any) => (
              <div key={symptom.id} className="rounded-2xl bg-[#fff7f5] p-3">
                <p>{new Date(symptom.date).toDateString()}</p>
                <p className="text-xs">Mood: {symptom.mood || "Â"}</p>
              </div>
            ))
          ) : (
            <p>No symptoms logged yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
