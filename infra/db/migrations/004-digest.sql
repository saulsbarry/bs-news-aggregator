-- Email digest subscriptions migration

CREATE TABLE IF NOT EXISTS digest_subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  frequency    TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_next
  ON digest_subscriptions (next_send_at) WHERE is_active = TRUE;
