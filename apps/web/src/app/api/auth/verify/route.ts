import { NextRequest, NextResponse } from "next/server";
import { consumeMagicToken } from "../../../../lib/auth/magic";
import { getUserById } from "../../../../lib/auth/user";
import { setSessionCookie } from "../../../../lib/auth/session";
import { getDb } from "../../../../lib/pg";

export const runtime = "nodejs";

function isSafeCallbackUrl(url: string): boolean {
  return /^\/[a-zA-Z0-9/_-]*$/.test(url);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const rawCallback = req.nextUrl.searchParams.get("callbackUrl") ?? "";
  const callbackUrl = isSafeCallbackUrl(rawCallback) ? rawCallback : "/account";

  if (!token) {
    return NextResponse.redirect(new URL("/auth/error?reason=invalid", req.url));
  }

  const userId = await consumeMagicToken(token);
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/error?reason=expired", req.url));
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.redirect(new URL("/auth/error?reason=invalid", req.url));
  }

  // Mark email as verified on first sign-in
  const db = await getDb();
  await db.query(
    `UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = $1`,
    [userId]
  );

  const res = NextResponse.redirect(new URL(callbackUrl, req.url));
  await setSessionCookie(res, user.id, user.email);
  return res;
}
