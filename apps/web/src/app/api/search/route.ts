import { NextResponse } from "next/server";
import { searchArticles } from "../../../lib/search";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().default(""),
  limit: z.coerce.number().min(1).max(100).default(20),
  topic: z.string().optional(),
  sourceId: z.string().uuid().optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
    limit: searchParams.get("limit"),
    topic: searchParams.get("topic") ?? undefined,
    sourceId: searchParams.get("sourceId") ?? undefined
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const result = await searchArticles(
    parsed.data.q,
    { topic: parsed.data.topic, sourceId: parsed.data.sourceId },
    parsed.data.limit
  );
  return NextResponse.json(result);
}
