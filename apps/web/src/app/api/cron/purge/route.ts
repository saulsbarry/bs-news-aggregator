import { NextResponse } from "next/server";
import { runPurge } from "../../../../lib/jobs/purge";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return new Response("CRON_SECRET is not configured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  if (token !== expectedSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const purgeResult = await runPurge();

  return NextResponse.json({ purge: purgeResult });
}
