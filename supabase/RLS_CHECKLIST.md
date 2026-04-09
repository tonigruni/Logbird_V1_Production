# Row Level Security (RLS) Checklist

## Migration File

`supabase/migrations/001_enable_rls.sql`

## Summary

All 8 tables have RLS enabled. Every table uses `user_id = auth.uid()` to restrict access so that authenticated users can only read and modify their own rows. Unauthenticated requests get zero rows (auth.uid() returns NULL).

## Table Policies

| Table | RLS Enabled | SELECT | INSERT | UPDATE | DELETE | Ownership Column |
|---|---|---|---|---|---|---|
| `journal_entries` | Yes | Own rows | Own rows | Own rows | Own rows | `user_id` |
| `journal_templates` | Yes | Own rows | Own rows | Own rows | Own rows | `user_id` |
| `wheel_categories` | Yes | Own rows | Own rows | Own rows | Own rows | `user_id` |
| `wheel_checkins` | Yes | Own rows | Own rows | Own rows | Own rows | `user_id` |
| `goals` | Yes | Own rows | Own rows | Own rows | Own rows | `user_id` |
| `tasks` | Yes | Own rows | Own rows | Own rows | Own rows | `user_id` |
| `user_profiles` | Yes | Own rows | Own rows | Own rows | Own rows | `user_id` |
| `ai_insights` | Yes | Own rows | Own rows | Own rows | Own rows | `user_id` |

## Policy Details

Each table has 4 policies (one per operation):

- **SELECT**: `USING (user_id = auth.uid())` -- can only read own rows
- **INSERT**: `WITH CHECK (user_id = auth.uid())` -- can only insert rows with own user_id
- **UPDATE**: `USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())` -- can only update own rows and cannot reassign ownership
- **DELETE**: `USING (user_id = auth.uid())` -- can only delete own rows

## Important Notes

- **Service role bypasses RLS**: The `service_role` key ignores all policies. Only use it server-side for admin operations.
- **Anon key respects RLS**: The `anon` key (used by the frontend) is subject to all policies.
- **No shared tables**: Every table in this schema is strictly user-owned. No public or shared-access patterns exist.

## How to Apply

```bash
# Via Supabase CLI
supabase db push

# Via psql
psql $DATABASE_URL -f supabase/migrations/001_enable_rls.sql

# Via Supabase Dashboard
# Paste the SQL into the SQL Editor and run
```
