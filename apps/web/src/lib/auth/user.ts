import { getDb } from "../pg";

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export async function findOrCreateUser(email: string): Promise<User> {
  const db = await getDb();
  const { rows } = await db.query<User>(
    `INSERT INTO users (email, last_sign_in_at)
     VALUES ($1, NOW())
     ON CONFLICT (email) DO UPDATE
       SET last_sign_in_at = NOW()
     RETURNING id, email, name`,
    [email]
  );
  return rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const { rows } = await db.query<User>(
    `SELECT id, email, name FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}
