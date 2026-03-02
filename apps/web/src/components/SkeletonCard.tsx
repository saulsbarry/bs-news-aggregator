export function SkeletonCard() {
  return (
    <li className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 shadow-sm p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </li>
  );
}
