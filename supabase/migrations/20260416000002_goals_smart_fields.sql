-- Add SMART goal fields + multi-select categories + milestones persistence
alter table goals
  add column if not exists category_ids  jsonb    null,
  add column if not exists outcome_metric text     null,
  add column if not exists success_criteria text   null,
  add column if not exists effort_frequency text   null,
  add column if not exists effort_minutes_per_session integer null,
  add column if not exists milestones     jsonb    null;
