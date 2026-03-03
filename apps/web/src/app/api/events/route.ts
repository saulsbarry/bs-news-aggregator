import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "../../../lib/pg";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const schema = z.object({
  event_type: z.enum(["cluster_click", "article_click"]),
  cluster_id: z.string().uuid().optional(),
  article_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { event_type, cluster_id, article_id } = parsed.data;

  let sessionId = req.cookies.get("session_id")?.value;
  const isNew = !sessionId;
  if (!sessionId) {
    sessionId = randomUUID();
  }

  try {
    const db = await getDb();
    await db.query(
      `INSERT INTO user_events (session_id, event_type, cluster_id, article_id)
       VALUES ($1, $2, $3, $4)`,
      [sessionId, event_type, cluster_id ?? null, article_id ?? null]
    );
  } catch {
    // Don't fail the request if event tracking fails
  }

  const res = new NextResponse(null, { status: 204 });
  if (isNew) {
    res.cookies.set("session_id", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
    });
  }
  return res;
}
