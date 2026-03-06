import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "../../../../lib/digestUnsubscribeToken";
import { cancelDigestSubscription } from "../../../../lib/digest";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const token = req.nextUrl.searchParams.get("token");

  if (!userId || !token || !verifyUnsubscribeToken(userId, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  await cancelDigestSubscription(userId);
  return NextResponse.redirect(new URL("/digest/confirm", req.url));
}
