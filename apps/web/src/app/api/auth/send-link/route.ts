import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cacheGet, cacheSet } from "../../../../lib/cache";
import { findOrCreateUser } from "../../../../lib/auth/user";
import { generateMagicToken, storeMagicToken } from "../../../../lib/auth/magic";
import { sendMagicLinkEmail } from "../../../../lib/auth/email";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://bs-news-aggregator-web.vercel.app";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email } = parsed.data;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rateKey = `auth:rate:${ip}`;

  // Rate limit: 3 requests per 10 minutes per IP
  const count = (await cacheGet<number>(rateKey)) ?? 0;
  if (count >= 3) {
    // Return 204 to not reveal rate limiting
    return new NextResponse(null, { status: 204 });
  }
  await cacheSet(rateKey, count + 1, 600);

  try {
    const user = await findOrCreateUser(email);
    const { raw, hash } = generateMagicToken();
    await storeMagicToken(user.id, hash);

    const callbackUrl = (req.nextUrl.searchParams.get("callbackUrl") ?? "").replace(/[^a-zA-Z0-9/_-]/g, "");
    const verifyUrl = `${BASE_URL}/api/auth/verify?token=${raw}${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;
    await sendMagicLinkEmail(email, verifyUrl);
  } catch (err) {
    console.error("[auth/send-link]", err);
    // Still return 204 — don't leak info about email existence
  }

  return new NextResponse(null, { status: 204 });
}
