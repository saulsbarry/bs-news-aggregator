import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/pg";
import { getRankedFeed } from "../../../../lib/feed";
import { buildDigestHtml, sendDigestEmail } from "../../../../lib/digestEmail";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = await getDb();

  type SubRow = {
    id: string;
    user_id: string;
    user_email: string;
    frequency: "daily" | "weekly";
  };

  const { rows: subs } = await db.query<SubRow>(
    `SELECT ds.id, ds.user_id, u.email AS user_email, ds.frequency
     FROM digest_subscriptions ds
     JOIN users u ON u.id = ds.user_id
     WHERE ds.is_active = TRUE
       AND ds.next_send_at <= NOW()
     ORDER BY ds.next_send_at
     LIMIT 50`
  );

  if (subs.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const feed = await getRankedFeed({ limit: 10, offset: 0 });
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      const label = sub.frequency === "daily" ? "Daily" : "Weekly";
      const subject = `${label} digest: Top stories from BS News`;
      const html = buildDigestHtml(sub.user_email, sub.user_id, feed.clusters, sub.frequency);
      await sendDigestEmail(sub.user_email, html, subject);

      // Update last_sent_at and compute next_send_at
      await db.query(
        `UPDATE digest_subscriptions
         SET last_sent_at = NOW(),
             next_send_at = CASE
               WHEN frequency = 'daily'  THEN NOW() + INTERVAL '1 day'
               WHEN frequency = 'weekly' THEN NOW() + INTERVAL '7 days'
             END
         WHERE id = $1`,
        [sub.id]
      );
      sent++;
    } catch (err) {
      console.error(`[digest] Failed for ${sub.user_email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed });
}
