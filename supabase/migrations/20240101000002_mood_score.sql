-- Add mood_score (1–5) to journal entries
alter table public.journal_entries
  add column if not exists mood_score smallint check (mood_score between 1 and 5);
