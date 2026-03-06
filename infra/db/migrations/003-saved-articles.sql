-- Saved articles migration

CREATE TABLE IF NOT EXISTS saved_articles (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_articles_user
  ON saved_articles (user_id, saved_at DESC);
