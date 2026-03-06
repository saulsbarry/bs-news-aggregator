import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../../lib/auth/session";
import { cancelDigestSubscription } from "../../../../lib/digest";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await cancelDigestSubscription(session.sub);
  return NextResponse.json({ cancelled: true });
}
