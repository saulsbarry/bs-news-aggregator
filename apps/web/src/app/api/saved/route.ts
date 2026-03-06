import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "../../../lib/auth/session";
import { getSavedArticles, saveArticle, unsaveArticle } from "../../../lib/saved";

export const runtime = "nodejs";

const bodySchema = z.object({ articleId: z.string().uuid() });

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await getSavedArticles(session.sub);
  return NextResponse.json({ articles });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid articleId" }, { status: 400 });

  await saveArticle(session.sub, parsed.data.articleId);
  return NextResponse.json({ saved: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid articleId" }, { status: 400 });

  await unsaveArticle(session.sub, parsed.data.articleId);
  return NextResponse.json({ saved: false });
}
