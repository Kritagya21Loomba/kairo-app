-- ================================================================
-- KAIRO v2.1 — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- ================================================================

-- ── 1. User profiles (linked to Supabase Auth) ──────────────────
CREATE TABLE IF NOT EXISTS kairo_profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username        TEXT UNIQUE,
  avatar_url      TEXT,
  anime_class     TEXT DEFAULT 'Curious Viewer',
  anime_class_jp  TEXT DEFAULT '好奇心旺盛な視聴者',
  is_public       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO kairo_profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_profile_on_signup();

-- ── 2. Library (watching / completed / plan / hold / dropped) ───
CREATE TABLE IF NOT EXISTS kairo_library (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id      INTEGER NOT NULL,          -- AniList ID
  title         TEXT NOT NULL,
  title_jp      TEXT,
  cover_url     TEXT,
  accent_color  TEXT,
  status        TEXT NOT NULL DEFAULT 'plan'
                  CHECK (status IN ('watching','completed','plan','dropped','hold')),
  user_rating   NUMERIC(3,1)
                  CHECK (user_rating >= 1 AND user_rating <= 10),
  notes         TEXT DEFAULT '',
  ep_progress   INTEGER DEFAULT 0,
  total_eps     INTEGER,
  genres        TEXT[],
  added_at      TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, anime_id)
);

-- ── 3. Episode ratings (per episode, for series) ────────────────
CREATE TABLE IF NOT EXISTS episode_ratings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id    INTEGER NOT NULL,
  episode_num INTEGER NOT NULL,
  rating      NUMERIC(3,1) NOT NULL CHECK (rating >= 1 AND rating <= 10),
  note        TEXT,
  is_spoiler  BOOLEAN DEFAULT false,
  watched_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, anime_id, episode_num)
);

-- ── 4. Anime reviews (overall — movies, OVAs, completed series) ──
CREATE TABLE IF NOT EXISTS anime_reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id    INTEGER NOT NULL,
  rating      NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  is_public   BOOLEAN DEFAULT true,
  is_spoiler  BOOLEAN DEFAULT false,
  watched_on  DATE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, anime_id)
);

-- ── 5. Anime comments (episode-level or overall) ─────────────────
CREATE TABLE IF NOT EXISTS anime_comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id    INTEGER NOT NULL,
  episode_num INTEGER,                     -- NULL = series/movie overall
  comment     TEXT NOT NULL,
  is_spoiler  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 6. Anime cache (ingested from AniList for fast search) ───────
CREATE TABLE IF NOT EXISTS anime_cache (
  anilist_id      INTEGER PRIMARY KEY,
  title_english   TEXT,
  title_romaji    TEXT,
  title_native    TEXT,
  cover_url       TEXT,
  banner_url      TEXT,
  cover_color     TEXT,
  status          TEXT,
  format          TEXT,
  episodes        INTEGER,
  duration        INTEGER,
  genres          TEXT[],
  average_score   INTEGER,
  popularity      INTEGER,
  season          TEXT,
  season_year     INTEGER,
  studio          TEXT,
  description     TEXT,
  ingested_at     TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
-- Full-text search index
CREATE INDEX IF NOT EXISTS anime_cache_search_idx
  ON anime_cache USING gin(to_tsvector('english',
    COALESCE(title_english,'') || ' ' ||
    COALESCE(title_romaji,'') || ' ' ||
    COALESCE(title_native,'')
  ));

-- ── 7. Row Level Security ────────────────────────────────────────
ALTER TABLE kairo_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kairo_library     ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_ratings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_reviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_cache       ENABLE ROW LEVEL SECURITY;

-- Profiles: owner can edit, public if is_public=true
CREATE POLICY "Public profiles readable" ON kairo_profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);
CREATE POLICY "Owner can update profile" ON kairo_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Library: owner only
CREATE POLICY "Library owner access" ON kairo_library
  FOR ALL USING (auth.uid() = user_id);

-- Episode ratings: owner only
CREATE POLICY "Episode ratings owner access" ON episode_ratings
  FOR ALL USING (auth.uid() = user_id);

-- Reviews: public readable, owner writable
CREATE POLICY "Public reviews readable" ON anime_reviews
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Reviews owner write" ON anime_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Comments: public readable, owner writable
CREATE POLICY "Comments public readable" ON anime_comments
  FOR SELECT USING (true);
CREATE POLICY "Comments owner write" ON anime_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Comments owner delete" ON anime_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Anime cache: public read, no user write
CREATE POLICY "Anime cache public read" ON anime_cache
  FOR SELECT USING (true);

-- ── 8. Verification ─────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('kairo_profiles','kairo_library','episode_ratings','anime_reviews','anime_comments','anime_cache')
ORDER BY table_name;
