import { NextResponse } from "next/server";
import { runEnrichment } from "../../../../lib/jobs/enrich";
import { runClustering } from "../../../../lib/jobs/cluster";
import { updateHotScores } from "../../../../lib/jobs/hotScore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;
    if (token !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const enrichResult = await runEnrichment();
  const clusterResult = await runClustering();
  await updateHotScores();

  return NextResponse.json({
    enrich: enrichResult,
    cluster: clusterResult
  });
}
