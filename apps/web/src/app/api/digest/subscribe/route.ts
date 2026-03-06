import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "../../../../lib/auth/session";
import { upsertDigestSubscription } from "../../../../lib/digest";

export const runtime = "nodejs";

const schema = z.object({ frequency: z.enum(["daily", "weekly"]) });

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });

  const sub = await upsertDigestSubscription(session.sub, parsed.data.frequency);
  return NextResponse.json({ subscription: sub });
}
