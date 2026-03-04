import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "../../../lib/pg";
import { randomUUID } from "crypto";
import { Redis } from "@upstash/redis";

// Rate limit: 30 requests per minute per IP
const RATE_LIMIT = 30;
const RATE_WINDOW = 60; // seconds

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

async function isRateLimited(ip: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return false; // if Redis isn't configured, allow through
  try {
    const key = `rate:events:${ip}`;
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, RATE_WINDOW);
    return count > RATE_LIMIT;
  } catch {
    return false; // don't block requests on Redis errors
  }
}

export const runtime = "nodejs";

const schema = z.object({
  event_type: z.enum(["cluster_click", "article_click"]),
  cluster_id: z.string().uuid().optional(),
  article_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (await isRateLimited(ip)) {
    return new NextResponse(null, { status: 429 });
  }

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
