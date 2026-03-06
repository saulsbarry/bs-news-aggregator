import { createHash, randomBytes } from "crypto";
import { getDb } from "../pg";

const TOKEN_TTL_MINUTES = 15;

export function generateMagicToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export async function storeMagicToken(userId: string, tokenHash: string): Promise<void> {
  const db = await getDb();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);
  await db.query(
    `INSERT INTO magic_link_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

export async function consumeMagicToken(rawToken: string): Promise<string | null> {
  const hash = createHash("sha256").update(rawToken).digest("hex");
  const db = await getDb();

  const { rows } = await db.query<{ user_id: string }>(
    `UPDATE magic_link_tokens
     SET used_at = NOW()
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     RETURNING user_id`,
    [hash]
  );

  return rows[0]?.user_id ?? null;
}
