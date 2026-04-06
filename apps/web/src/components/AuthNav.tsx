"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
}

export function AuthNav() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  // Still loading — render nothing to avoid layout shift
  if (user === undefined) return null;

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/saved"
        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        Saved
      </Link>
      <Link
        href="/account"
        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        Account
      </Link>
    </div>
  );
}
