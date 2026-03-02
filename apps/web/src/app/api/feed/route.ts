import { NextResponse } from "next/server";
import { getRankedFeed } from "../../../lib/feed";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  timeRange: z.enum(["24h", "48h", "7d"]).optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    limit: searchParams.get("limit"),
    offset: searchParams.get("offset"),
    timeRange: searchParams.get("timeRange") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const topics = searchParams.getAll("topic").filter(Boolean);
  const sourceIds = searchParams.getAll("sourceId").filter(Boolean);

  const feed = await getRankedFeed({ ...parsed.data, topics, sourceIds });
  return NextResponse.json(feed);
}
