-- Migration: reduce embedding dimensions from 1536 to 512
--
-- Run this in Supabase BEFORE deploying the code change.
-- Existing embeddings are incompatible with the new dimension and must be cleared;
-- they will be re-generated automatically by the enrich cron.

-- Drop the IVFFlat index first (required before altering column type)
DROP INDEX IF EXISTS idx_article_embeddings_embedding;

-- Clear existing 1536-dim embeddings
TRUNCATE article_embeddings;

-- Alter column to 512 dimensions
ALTER TABLE article_embeddings ALTER COLUMN embedding TYPE vector(512);

-- Recreate the IVFFlat index for the new dimension
CREATE INDEX idx_article_embeddings_embedding
  ON article_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
