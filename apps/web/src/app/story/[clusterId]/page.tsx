import Link from "next/link";
import { getClusterById } from "../../../lib/cluster";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ clusterId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clusterId } = await params;
  const cluster = await getClusterById(clusterId);
  if (!cluster) return {};
  return {
    title: `${cluster.mainTitle} | BS News`,
    description: cluster.summary ?? undefined
  };
}

export default async function StoryPage({ params }: Props) {
  const { clusterId } = await params;
  const cluster = await getClusterById(clusterId);
  if (!cluster) notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {cluster.primaryTopic && <span>{cluster.primaryTopic}</span>}
          {cluster.primaryTopic && <span>·</span>}
          <span>{cluster.articles.length} articles</span>
          {cluster.lastUpdatedHuman && (
            <>
              <span>·</span>
              <span>Updated {cluster.lastUpdatedHuman}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {cluster.mainTitle}
        </h1>
        {cluster.summary && (
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
            {cluster.summary}
          </p>
        )}
      </header>

      <ul className="space-y-3">
        {cluster.articles.map((article) => (
          <li
            key={article.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 shadow-sm p-4 flex flex-col gap-1"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                href={`/article/${article.id}`}
                className="text-base font-medium leading-snug hover:underline"
              >
                {article.title}
              </Link>
              {article.isPrimary && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  Primary
                </span>
              )}
            </div>
            {article.summary && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {article.summary}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{article.sourceName}</span>
              <span>·</span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Read original →
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
