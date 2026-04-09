-- ============================================================================
-- Migration: Enable Row Level Security (RLS) on all tables
--
-- PROBLEM: All Supabase queries currently filter by user_id client-side only.
-- Without RLS, any authenticated user can bypass the client and query other
-- users' data directly via the Supabase REST API or PostgREST.
--
-- SOLUTION: Enable RLS on every table and create policies that restrict
-- SELECT, INSERT, UPDATE, and DELETE to rows owned by the authenticated user
-- (where user_id = auth.uid()).
--
-- Tables covered: journal_entries, journal_templates, wheel_categories,
--                 wheel_checkins, goals, tasks, user_profiles
-- Note: ai_insights table does not exist in this database.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. journal_entries
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can create their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON public.journal_entries;

CREATE POLICY "Users can view their own journal entries"
  ON public.journal_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own journal entries"
  ON public.journal_entries FOR DELETE
  USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- 2. journal_templates
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.journal_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own journal templates" ON public.journal_templates;
DROP POLICY IF EXISTS "Users can create their own journal templates" ON public.journal_templates;
DROP POLICY IF EXISTS "Users can update their own journal templates" ON public.journal_templates;
DROP POLICY IF EXISTS "Users can delete their own journal templates" ON public.journal_templates;

CREATE POLICY "Users can view their own journal templates"
  ON public.journal_templates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own journal templates"
  ON public.journal_templates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own journal templates"
  ON public.journal_templates FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own journal templates"
  ON public.journal_templates FOR DELETE
  USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- 3. wheel_categories
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.wheel_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wheel categories" ON public.wheel_categories;
DROP POLICY IF EXISTS "Users can create their own wheel categories" ON public.wheel_categories;
DROP POLICY IF EXISTS "Users can update their own wheel categories" ON public.wheel_categories;
DROP POLICY IF EXISTS "Users can delete their own wheel categories" ON public.wheel_categories;

CREATE POLICY "Users can view their own wheel categories"
  ON public.wheel_categories FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own wheel categories"
  ON public.wheel_categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own wheel categories"
  ON public.wheel_categories FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own wheel categories"
  ON public.wheel_categories FOR DELETE
  USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- 4. wheel_checkins
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.wheel_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wheel checkins" ON public.wheel_checkins;
DROP POLICY IF EXISTS "Users can create their own wheel checkins" ON public.wheel_checkins;
DROP POLICY IF EXISTS "Users can update their own wheel checkins" ON public.wheel_checkins;
DROP POLICY IF EXISTS "Users can delete their own wheel checkins" ON public.wheel_checkins;

CREATE POLICY "Users can view their own wheel checkins"
  ON public.wheel_checkins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own wheel checkins"
  ON public.wheel_checkins FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own wheel checkins"
  ON public.wheel_checkins FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own wheel checkins"
  ON public.wheel_checkins FOR DELETE
  USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- 5. goals
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;

CREATE POLICY "Users can view their own goals"
  ON public.goals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own goals"
  ON public.goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals"
  ON public.goals FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals"
  ON public.goals FOR DELETE
  USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- 6. tasks
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- 7. user_profiles
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own profile"
  ON public.user_profiles FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- NOTES:
--
-- 1. auth.uid() returns the UUID of the currently authenticated user from
--    the Supabase JWT. Unauthenticated requests will have auth.uid() = NULL,
--    meaning no rows will match and access is denied by default.
--
-- 2. UPDATE policies use both USING (which rows can be seen/targeted) and
--    WITH CHECK (what the row must look like after the update). This prevents
--    a user from reassigning their row to another user_id.
--
-- 3. The service_role key bypasses RLS entirely. Server-side admin functions
--    that need cross-user access should use the service_role client.
-- ============================================================================
