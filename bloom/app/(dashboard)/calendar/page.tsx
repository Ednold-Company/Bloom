"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Card from "@/components/ui/Card";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthToken } from "@/lib/useAuthToken";

type CycleForm = { startDate: string; endDate?: string };
type Cycle = { id: string; startDate: string; endDate?: string | null };

export default function CalendarPage() {
  const [value, setValue] = useState<Date | null>(new Date());
  const { register, handleSubmit, reset } = useForm<CycleForm>();
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [needsEndPrompt, setNeedsEndPrompt] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const openCycle = cyclesQuery.data?.find((cycle) => !cycle.endDate) ?? null;

  const createCycle = useMutation({
    mutationFn: async (values: CycleForm) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      await api.post("/cycles", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      reset();
      setNeedsEndPrompt(true);
      setCreateError(null);
    },
    onError: () => {
      setCreateError("We couldn't save that cycle. Check your dates and try again.");
    },
  });

  const updateCycle = useMutation({
    mutationFn: async (values: { id: string; startDate: string; endDate?: string }) => {
      await api.put(`/cycles/${values.id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      setNeedsEndPrompt(false);
    },
  });

  const deleteCycle = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cycles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      setEditingId(null);
    },
  });

  return (
    <div className="grid gap-6">
      <Card title="Cycle calendar">
        <div className="rounded-3xl p-4" style={{ backgroundColor: "var(--card)" }}>
          <Calendar onChange={(date) => setValue(date as Date)} value={value} />
        </div>
      </Card>
      <Card title="Log a cycle">
        <form
          onSubmit={handleSubmit((values) => createCycle.mutate(values))}
          className="grid gap-4 md:grid-cols-2"
        >
          <label className="grid gap-2 text-sm" style={{ color: "var(--muted)" }}>
            Period start date
            <input
              {...register("startDate", { required: true })}
              type="date"
              className="w-full rounded-2xl border px-4 py-3 text-sm"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
            />
          </label>
          <label className="grid gap-2 text-sm" style={{ color: "var(--muted)" }}>
            Period end date (optional)
            <input
              {...register("endDate")}
              type="date"
              className="w-full rounded-2xl border px-4 py-3 text-sm"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
            />
          </label>
          <button
            type="submit"
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-white md:col-span-2 disabled:opacity-60"
            style={{ backgroundColor: "var(--accent)" }}
            disabled={createCycle.isPending}
          >
            {createCycle.isPending ? "Saving..." : "Save cycle"}
          </button>
        </form>
        {createError ? (
          <p className="mt-3 text-sm" style={{ color: "#d94f70" }}>{createError}</p>
        ) : null}
        {needsEndPrompt && openCycle ? (
          <div
            className="mt-4 rounded-2xl border p-4 text-sm"
            style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--card) 90%)", color: "var(--muted)" }}
          >
            You saved a period start. When your period ends, update the end date below.
          </div>
        ) : null}
      </Card>
      <Card title="Update period end">
        {openCycle ? (
          <div className="grid gap-3">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Current period started on{" "}
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                {new Date(openCycle.startDate).toDateString()}
              </span>
              . Add the end date when it finishes.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const endDate = String(formData.get("endDate") || "");
                if (!endDate) return;
                updateCycle.mutate({
                  id: openCycle.id,
                  startDate: openCycle.startDate,
                  endDate,
                });
              }}
              className="grid gap-3 md:grid-cols-[1fr_auto]"
            >
              <input
                name="endDate"
                type="date"
                className="w-full rounded-2xl border px-4 py-3 text-sm"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
              />
              <button
                type="submit"
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--foreground)" }}
                disabled={updateCycle.isPending}
              >
                {updateCycle.isPending ? "Saving..." : "Save end date"}
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No open period right now. Log a start date to begin tracking.
          </p>
        )}
      </Card>
      <Card title="Edit or delete cycles">
        {cyclesQuery.data?.length ? (
          <div className="grid gap-4">
            {cyclesQuery.data.map((cycle) => {
              const isEditing = editingId === cycle.id;
              return (
                <div
                  key={cycle.id}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--card) 92%, transparent)" }}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const startDate = String(formData.get("startDate") || "");
                        const endDate = String(formData.get("endDate") || "");
                        if (!startDate) return;
                        updateCycle.mutate({
                          id: cycle.id,
                          startDate,
                          endDate: endDate || undefined,
                        });
                        setEditingId(null);
                      }}
                      className="grid gap-3 md:grid-cols-2"
                    >
                      <label className="grid gap-2 text-sm" style={{ color: "var(--muted)" }}>
                        Start date
                        <input
                          name="startDate"
                          type="date"
                          defaultValue={cycle.startDate.slice(0, 10)}
                          className="w-full rounded-2xl border px-4 py-3 text-sm"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                      </label>
                      <label className="grid gap-2 text-sm" style={{ color: "var(--muted)" }}>
                        End date (optional)
                        <input
                          name="endDate"
                          type="date"
                          defaultValue={cycle.endDate ? cycle.endDate.slice(0, 10) : ""}
                          className="w-full rounded-2xl border px-4 py-3 text-sm"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                      </label>
                      <div className="flex gap-2 md:col-span-2">
                        <button
                          type="submit"
                          className="rounded-2xl px-4 py-2 text-sm font-semibold text-white"
                          style={{ backgroundColor: "var(--foreground)" }}
                        >
                          Save changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-2xl border px-4 py-2 text-sm font-semibold"
                          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--muted)" }}>
                      <div>
                        Start:{" "}
                        <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                          {new Date(cycle.startDate).toDateString()}
                        </span>
                      </div>
                      <div>
                        End:{" "}
                        <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                          {cycle.endDate ? new Date(cycle.endDate).toDateString() : "Not set"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(cycle.id)}
                          className="rounded-2xl border px-3 py-1 text-xs font-semibold"
                          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCycle.mutate(cycle.id)}
                          className="rounded-2xl border px-3 py-1 text-xs font-semibold"
                          style={{ borderColor: "var(--border)", color: "#d94f70" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--muted)" }}>No cycles logged yet.</p>
        )}
      </Card>
      <Card title="What this means">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Mark period days and symptoms to improve predictions. Your fertility window will appear here after a few
          cycles.
        </p>
      </Card>
    </div>
  );
}
