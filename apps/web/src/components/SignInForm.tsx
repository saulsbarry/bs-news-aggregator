"use client";

import { useState } from "react";

type State = "idle" | "loading" | "sent" | "error";

interface Props {
  callbackUrl?: string;
}

export function SignInForm({ callbackUrl }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const url = callbackUrl
        ? `/api/auth/send-link?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/api/auth/send-link";
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">Check your inbox</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {state === "error" && (
        <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {state === "loading" ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
