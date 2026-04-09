# Security Fixes — Deployment Guide

All code changes are done. These steps require your Supabase dashboard access.

---

## 1. Apply Row Level Security (RLS)

This is the most critical step — without it, any authenticated user can read other users' data.

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Open the file `supabase/migrations/001_enable_rls.sql` from this project
3. Copy the entire contents and paste into the SQL Editor
4. Click **Run**
5. Verify: Go to **Table Editor** → click any table → **RLS** tab should show "RLS enabled" with policies listed

Tables covered: `journal_entries`, `journal_templates`, `wheel_categories`, `wheel_checkins`, `goals`, `tasks`, `user_profiles`, `ai_insights`

---

## 2. Deploy the Anthropic Proxy Edge Function

This moves API key handling server-side so it's never exposed in the browser.

### Option A: Via Supabase CLI (recommended)

```bash
# Install CLI if you don't have it
npm install -g supabase

# Login
supabase login

# Link to your project (find project ref in Dashboard → Settings → General)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy anthropic-proxy
```

### Option B: Via Supabase Dashboard

1. Go to **Edge Functions** in the sidebar
2. Click **New Function**
3. Name it `anthropic-proxy`
4. Paste the contents of `supabase/functions/anthropic-proxy/index.ts`
5. Deploy

### After deploying:

The edge function uses these secrets (all auto-provided by Supabase):
- `SUPABASE_URL` ✅ auto-available
- `SUPABASE_ANON_KEY` ✅ auto-available  
- `SUPABASE_SERVICE_ROLE_KEY` ✅ auto-available

No additional secrets needed — the Anthropic API key is read from `user_profiles` at runtime.

---

## 3. Verify Everything Works

1. Open the app and log in (not demo mode)
2. Go to **Settings** → save your Anthropic API key (this still saves to `user_profiles`)
3. Go to **Journal** → create an entry → trigger AI analysis
4. The AI call should now go through the edge function (check Network tab — request should go to `YOUR_SUPABASE_URL/functions/v1/anthropic-proxy`)
5. Open the AI chat assistant and send a message — should also work through the proxy

---

## 4. Optional Cleanup

After verifying the edge function works:

- You can remove `@anthropic-ai/sdk` from `package.json` if it's no longer needed (it was only used for browser-side calls, now replaced by fetch). Check if anything still imports it first.
- Consider removing the `anthropic_api_key` from `localStorage` reads in the Settings page — the key is now only needed in `user_profiles` (server-side).

---

## Summary of What Changed

| Change | Status |
|--------|--------|
| npm install (lockfile) | ✅ Done |
| TypeScript compiles | ✅ Done |
| RLS migration SQL | 📋 Ready — needs to be run in Supabase |
| Edge Function | 📋 Ready — needs to be deployed |
| All other code fixes | ✅ Done |
