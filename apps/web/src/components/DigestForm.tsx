"use client";

import { useState } from "react";

type Frequency = "daily" | "weekly";
type State = "idle" | "loading" | "success" | "cancelled" | "error";

interface Props {
  initialFrequency?: Frequency;
  initialActive?: boolean;
}

export function DigestForm({ initialFrequency, initialActive }: Props) {
  const [frequency, setFrequency] = useState<Frequency>(initialFrequency ?? "daily");
  const [active, setActive] = useState(initialActive ?? false);
  const [state, setState] = useState<State>("idle");

  async function subscribe() {
    setState("loading");
    try {
      const res = await fetch("/api/digest/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency }),
      });
      if (res.ok) {
        setActive(true);
        setState("success");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  async function cancel() {
    setState("loading");
    try {
      const res = await fetch("/api/digest/cancel", {
        method: "POST",
      });
      if (res.ok) {
        setActive(false);
        setState("cancelled");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <div className="space-y-3">
      {!active ? (
        <>
          <div className="flex items-center gap-3">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <button
              onClick={subscribe}
              disabled={state === "loading"}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {state === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </div>
          {state === "success" && (
            <p className="text-sm text-green-600 dark:text-green-400">Subscribed! You&apos;ll receive your first digest soon.</p>
          )}
          {state === "cancelled" && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Unsubscribed from digest emails.</p>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Subscribed to <strong>{frequency}</strong> digest.
          </p>
          <button
            onClick={cancel}
            disabled={state === "loading"}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 underline transition"
          >
            {state === "loading" ? "Cancelling…" : "Cancel subscription"}
          </button>
        </div>
      )}
      {state === "error" && (
        <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
