-- supabase/migrations/20260419000001_checkin_enhancements.sql

-- ─── wheel_checkins: new columns ───────────────────────────────────────────
ALTER TABLE wheel_checkins
  ADD COLUMN IF NOT EXISTS energy_level        SMALLINT,
  ADD COLUMN IF NOT EXISTS mood_words          TEXT[],
  ADD COLUMN IF NOT EXISTS intention           TEXT,
  ADD COLUMN IF NOT EXISTS gratitude           JSONB,
  ADD COLUMN IF NOT EXISTS meditation_completed BOOLEAN DEFAULT FALSE;

-- ─── habits ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  icon        TEXT,
  color       TEXT,
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_habits_select" ON habits;
CREATE POLICY "user_habits_select" ON habits
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_habits_insert" ON habits;
CREATE POLICY "user_habits_insert" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_habits_update" ON habits;
CREATE POLICY "user_habits_update" ON habits
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_habits_delete" ON habits;
CREATE POLICY "user_habits_delete" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- ─── habit_logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id    UUID        NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  logged_date DATE        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (habit_id, logged_date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_habit_logs_select" ON habit_logs;
CREATE POLICY "user_habit_logs_select" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_habit_logs_insert" ON habit_logs;
CREATE POLICY "user_habit_logs_insert" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_habit_logs_delete" ON habit_logs;
CREATE POLICY "user_habit_logs_delete" ON habit_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ─── user_profiles: purpose columns ─────────────────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS purpose_statement TEXT,
  ADD COLUMN IF NOT EXISTS purpose_pillars   JSONB;
