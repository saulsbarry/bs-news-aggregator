import { SignInForm } from "../../../components/SignInForm";

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your email and we&apos;ll send you a sign-in link.
          </p>
        </div>
        <SignInForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
