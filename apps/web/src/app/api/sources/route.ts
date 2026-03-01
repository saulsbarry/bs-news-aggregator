import { NextResponse } from "next/server";
import { getSources } from "../../../lib/sources";

export const dynamic = "force-dynamic";

export async function GET() {
  const sources = await getSources();
  return NextResponse.json({ sources });
}
