import { SkeletonCard } from "../../components/SkeletonCard";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <ul className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ul>
    </div>
  );
}
