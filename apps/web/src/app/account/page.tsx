import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "../../lib/auth/session";
import { getDigestSubscription } from "../../lib/digest";
import { DigestForm } from "../../components/DigestForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/auth/signin?callbackUrl=/account");

  const digestSub = await getDigestSubscription(session.sub);

  return (
    <div className="max-w-lg space-y-8">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{session.email}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Saved articles
        </h2>
        <Link
          href="/saved"
          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View saved articles →
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Email digest
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get a curated digest of top stories delivered to your inbox.
        </p>
        <DigestForm
          initialFrequency={digestSub?.frequency}
          initialActive={digestSub?.isActive ?? false}
        />
      </section>

      <section>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}
