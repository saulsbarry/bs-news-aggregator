import { NextResponse } from "next/server";
import { getTrendingTopics } from "../../../lib/trending";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const topics = await getTrendingTopics();
  return NextResponse.json({ topics }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
