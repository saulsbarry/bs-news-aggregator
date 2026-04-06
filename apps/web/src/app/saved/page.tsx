import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "../../lib/auth/session";
import { getSavedArticles } from "../../lib/saved";
import { formatDistanceToNowStrict } from "date-fns";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/auth/signin?callbackUrl=/saved");

  const articles = await getSavedArticles(session.sub);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Saved articles</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Articles you&apos;ve bookmarked for later.
        </p>
      </section>

      {articles.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
          Save articles from any story to read them later.
        </p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li
              key={article.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 shadow-sm p-4 flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/article/${article.id}`}
                  className="text-base font-medium leading-snug hover:underline"
                >
                  {article.title}
                </Link>
              </div>
              {article.summary && (
                <p className="text-sm text-slate-600 dark:text-slate-300">{article.summary}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{article.source_name}</span>
                <span>·</span>
                <span>{formatDistanceToNowStrict(article.published_at, { addSuffix: true })}</span>
                {article.cluster_id && article.cluster_title && (
                  <>
                    <span>·</span>
                    <Link
                      href={`/story/${article.cluster_id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View story →
                    </Link>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
