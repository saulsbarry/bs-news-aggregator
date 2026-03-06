import { NextRequest, NextResponse } from "next/server";
import { revokeSessionJwt } from "../../../../lib/auth/jwt";
import { clearSessionCookie, getTokenFromRequest } from "../../../../lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (token) {
    await revokeSessionJwt(token);
  }

  const res = NextResponse.redirect(new URL("/", req.url));
  clearSessionCookie(res);
  return res;
}
