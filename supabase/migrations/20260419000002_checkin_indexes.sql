-- supabase/migrations/20260419000002_checkin_indexes.sql

CREATE INDEX IF NOT EXISTS habit_logs_user_id_logged_date_idx
  ON habit_logs (user_id, logged_date);

CREATE INDEX IF NOT EXISTS habits_user_id_idx
  ON habits (user_id);

ALTER TABLE wheel_checkins
  DROP CONSTRAINT IF EXISTS wheel_checkins_energy_level_check;

ALTER TABLE wheel_checkins
  ADD CONSTRAINT wheel_checkins_energy_level_check
  CHECK (energy_level IS NULL OR (energy_level BETWEEN 1 AND 5));
