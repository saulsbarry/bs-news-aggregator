-- Core schema for BS News Aggregator
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- Sources providing content (RSS, APIs)
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('rss', 'api')),
  url TEXT NOT NULL,
  logo_url TEXT,
  category TEXT,
  language TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_fetched_at TIMESTAMPTZ,
  fetch_interval_minutes INT NOT NULL DEFAULT 30,
  priority_score REAL NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles as fetched from sources
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  raw_content TEXT,
  summary TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  language TEXT,
  cluster_id UUID,
  topic_primary TEXT DEFAULT 'World',
  topics JSONB,
  sentiment REAL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_source_external
  ON articles (source_id, external_id);

CREATE INDEX IF NOT EXISTS idx_articles_published_at
  ON articles (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_source_published_at
  ON articles (source_id, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_topic_primary
  ON articles (topic_primary);

-- Clusters (story groups)
CREATE TABLE IF NOT EXISTS clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_title TEXT,
  summary TEXT,
  topic_primary TEXT DEFAULT 'World',
  topics JSONB,
  hot_score REAL NOT NULL DEFAULT 0,
  sentiment_aggregate REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many mapping between clusters and articles
CREATE TABLE IF NOT EXISTS cluster_articles (
  cluster_id UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cluster_id, article_id)
);

-- Embeddings table using pgvector (one per article)
CREATE TABLE IF NOT EXISTS article_embeddings (
  article_id UUID PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  embedding vector(512) NOT NULL,
  model_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_embeddings_embedding
  ON article_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Users (optional, can be extended later)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  auth_provider TEXT,
  settings JSONB,
  preferred_topics JSONB,
  preferred_sources JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Engagement events for ranking
CREATE TABLE IF NOT EXISTS user_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  article_id UUID,
  cluster_id UUID,
  event_type TEXT NOT NULL,
  value REAL,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_events_article
  ON user_events (article_id);

CREATE INDEX IF NOT EXISTS idx_user_events_cluster
  ON user_events (cluster_id);

-- Ingestion jobs and logs
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id BIGSERIAL PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  error TEXT,
  fetched_count INT,
  new_articles_count INT
);

-- Full-text search configuration
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_articles_search_vector
  ON articles
  USING GIN (search_vector);

CREATE OR REPLACE FUNCTION articles_update_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.summary, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_articles_search_vector ON articles;

CREATE TRIGGER trg_articles_search_vector
BEFORE INSERT OR UPDATE OF title, summary
ON articles
FOR EACH ROW
EXECUTE PROCEDURE articles_update_search_vector();

