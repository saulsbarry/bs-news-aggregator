import { NextResponse } from "next/server";
import { getTopics } from "../../../lib/topics";

export async function GET() {
  const topics = await getTopics();
  return NextResponse.json(
    { topics },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
