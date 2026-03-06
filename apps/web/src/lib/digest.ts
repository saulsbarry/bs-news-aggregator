import { getDb } from "./pg";

export interface DigestSubscription {
  id: string;
  userId: string;
  frequency: "daily" | "weekly";
  isActive: boolean;
  lastSentAt: Date | null;
  nextSendAt: Date;
}

export async function getDigestSubscription(userId: string): Promise<DigestSubscription | null> {
  const db = await getDb();
  type Row = {
    id: string;
    user_id: string;
    frequency: "daily" | "weekly";
    is_active: boolean;
    last_sent_at: Date | null;
    next_send_at: Date;
  };
  const { rows } = await db.query<Row>(
    `SELECT id, user_id, frequency, is_active, last_sent_at, next_send_at
     FROM digest_subscriptions WHERE user_id = $1`,
    [userId]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    frequency: r.frequency,
    isActive: r.is_active,
    lastSentAt: r.last_sent_at,
    nextSendAt: r.next_send_at,
  };
}

function calcNextSendAt(frequency: "daily" | "weekly"): Date {
  const d = new Date();
  // Next 07:00 UTC
  d.setUTCHours(7, 0, 0, 0);
  if (d <= new Date()) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  if (frequency === "weekly") {
    // Advance to next Monday
    const day = d.getUTCDay(); // 0=Sun, 1=Mon
    const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
    d.setUTCDate(d.getUTCDate() + (day === 1 ? 0 : daysUntilMonday));
  }
  return d;
}

export async function upsertDigestSubscription(
  userId: string,
  frequency: "daily" | "weekly"
): Promise<DigestSubscription> {
  const db = await getDb();
  const nextSendAt = calcNextSendAt(frequency);
  type Row = {
    id: string;
    user_id: string;
    frequency: "daily" | "weekly";
    is_active: boolean;
    last_sent_at: Date | null;
    next_send_at: Date;
  };
  const { rows } = await db.query<Row>(
    `INSERT INTO digest_subscriptions (user_id, frequency, is_active, next_send_at)
     VALUES ($1, $2, TRUE, $3)
     ON CONFLICT (user_id) DO UPDATE
       SET frequency = EXCLUDED.frequency,
           is_active = TRUE,
           next_send_at = EXCLUDED.next_send_at
     RETURNING id, user_id, frequency, is_active, last_sent_at, next_send_at`,
    [userId, frequency, nextSendAt]
  );
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    frequency: r.frequency,
    isActive: r.is_active,
    lastSentAt: r.last_sent_at,
    nextSendAt: r.next_send_at,
  };
}

export async function cancelDigestSubscription(userId: string): Promise<void> {
  const db = await getDb();
  await db.query(
    `UPDATE digest_subscriptions SET is_active = FALSE WHERE user_id = $1`,
    [userId]
  );
}
