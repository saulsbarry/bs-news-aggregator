import { NextResponse } from "next/server";
import { getSources } from "../../../lib/sources";

export async function GET() {
  const sources = await getSources();
  return NextResponse.json(
    { sources },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
