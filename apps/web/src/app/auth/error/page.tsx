import Link from "next/link";

interface Props {
  searchParams: Promise<{ reason?: string }>;
}

const messages: Record<string, string> = {
  invalid: "This sign-in link is invalid.",
  expired: "This sign-in link has expired or has already been used.",
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const { reason } = await searchParams;
  const message = messages[reason ?? ""] ?? "Something went wrong with your sign-in link.";

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign-in failed</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <Link
          href="/auth/signin"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
