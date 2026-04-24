-- ====================================================================================
-- Kairo v3 Database Schema Additions
-- Run this in your Supabase SQL Editor
-- ====================================================================================

-- 1. Watch Logs
-- Tracks the specific episodes and dates users watch anime
CREATE TABLE IF NOT EXISTS public.kairo_watch_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    anime_id INTEGER NOT NULL,
    anime_title TEXT NOT NULL,
    cover_url TEXT,
    format TEXT,
    ep_start INTEGER,
    ep_end INTEGER,
    watched_on DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_min INTEGER,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quickly fetching a user's recent logs
CREATE INDEX IF NOT EXISTS idx_watch_logs_user_date 
ON public.kairo_watch_logs (user_id, watched_on DESC);

-- Enable RLS for watch logs
ALTER TABLE public.kairo_watch_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watch logs"
ON public.kairo_watch_logs
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Personal Arcs
-- Allows users to create custom "arcs" or eras of their watch history
CREATE TABLE IF NOT EXISTS public.kairo_arcs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    anime_id INTEGER,
    ep_start INTEGER,
    ep_end INTEGER,
    ranking INTEGER,  -- 1 = favourite
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for personal arcs
ALTER TABLE public.kairo_arcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own arcs"
ON public.kairo_arcs
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Achievements
-- Gamification system tracking earned badges
CREATE TABLE IF NOT EXISTS public.kairo_achievements (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);

-- Enable RLS for achievements
ALTER TABLE public.kairo_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
ON public.kairo_achievements
FOR SELECT USING (auth.uid() = user_id);

-- Let users insert their own earned achievements (could be tightened later via RPC)
CREATE POLICY "Users can earn achievements"
ON public.kairo_achievements
FOR INSERT WITH CHECK (auth.uid() = user_id);
