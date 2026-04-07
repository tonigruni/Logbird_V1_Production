-- ============================================================
-- Migration: Add context fields to journal_entries
-- Run this in your Supabase project → SQL Editor
-- ============================================================

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS category text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS location text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS weather  text DEFAULT NULL;

-- Index for fast category filtering per user
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_category
  ON journal_entries (user_id, category)
  WHERE category IS NOT NULL;

COMMENT ON COLUMN journal_entries.category IS 'Entry category (e.g. Personal, Work, Dreams, Ideas, Travel, Health, Gratitude)';
COMMENT ON COLUMN journal_entries.location  IS 'Location where the entry was written (free text)';
COMMENT ON COLUMN journal_entries.weather   IS 'Weather conditions at time of writing (free text)';
