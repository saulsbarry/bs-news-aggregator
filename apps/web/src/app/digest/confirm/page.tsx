import Link from "next/link";

export default function DigestConfirmPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Unsubscribed</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You&apos;ve been unsubscribed from BS News digests.
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
