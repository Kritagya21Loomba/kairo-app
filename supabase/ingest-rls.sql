-- Run this in Supabase SQL Editor to enable ingestion with the anon key
-- (anime_cache is just public data from AniList — safe to allow writes)

CREATE POLICY "Anime cache insert (ingest)" ON anime_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anime cache update (ingest)" ON anime_cache
  FOR UPDATE USING (true);
