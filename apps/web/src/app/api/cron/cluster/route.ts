import { NextResponse } from "next/server";
import { runClustering } from "../../../../lib/jobs/cluster";
import { updateHotScores } from "../../../../lib/jobs/hotScore";
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

  const clusterResult = await runClustering();
  await updateHotScores();
  const purgeResult = await runPurge();

  return NextResponse.json({ cluster: clusterResult, purge: purgeResult });
}
