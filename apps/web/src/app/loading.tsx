import { SkeletonCard } from "../components/SkeletonCard";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <ul className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ul>
    </div>
  );
}
