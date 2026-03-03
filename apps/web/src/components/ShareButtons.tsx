"use client";

import { useState } from "react";

interface Props {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  function open(href: string) {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const buttons = [
    {
      label: "X",
      onClick: () =>
        open(`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`),
    },
    {
      label: "Facebook",
      onClick: () =>
        open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`),
    },
    {
      label: "LinkedIn",
      onClick: () =>
        open(`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500 dark:text-slate-400">Share:</span>
      {buttons.map(({ label, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          {label}
        </button>
      ))}
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encoded}`}
        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        Email
      </a>
      <button
        onClick={copyLink}
        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
