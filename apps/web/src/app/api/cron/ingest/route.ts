import { NextResponse } from "next/server";
import { fetchAllSources } from "../../../../lib/ingestion/pipeline";

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

  const summary = await fetchAllSources();

  return NextResponse.json(summary);
}

