import Link from "next/link";
import { getArticleById } from "../../../lib/article";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "../../../components/JsonLd";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://bs-news-aggregator-web.vercel.app";

function truncate(text: string, max: number) {
  return text.length <= max ? text : text.slice(0, max - 1) + "…";
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return {};
  const ogTitle = truncate(article.title, 60);
  const ogDescription = article.summary ? truncate(article.summary, 160) : undefined;
  const ogImageUrl = `/api/og?title=${encodeURIComponent(article.title)}`;
  return {
    title: `${article.title} | BS News`,
    description: ogDescription,
    openGraph: {
      type: "article",
      url: `${BASE_URL}/article/${id}`,
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      publishedTime: article.publishedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    url: article.url,
    datePublished: article.publishedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: article.sourceName,
    },
    publisher: {
      "@type": "Organization",
      name: "BS News",
      url: BASE_URL,
    },
  };

  return (
    <div className="space-y-6">
      <JsonLd data={jsonLd} />
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{article.sourceName}</span>
          <span>·</span>
          <span>{article.publishedAtHuman}</span>
          {article.topicPrimary && (
            <>
              <span>·</span>
              <span>{article.topicPrimary}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {article.title}
        </h1>
        {article.summary && (
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
            {article.summary}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-4">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Read full article on {article.sourceName} →
        </a>

        {article.clusterId && article.clusterTitle && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Part of story:{" "}
            <Link
              href={`/story/${article.clusterId}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {article.clusterTitle}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
