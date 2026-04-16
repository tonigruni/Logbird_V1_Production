-- Fix goals table schema to match app expectations:
-- 1. Make space_id nullable (UI doesn't use spaces concept)
-- 2. Add category_id column that GoalCreate.tsx inserts

alter table goals alter column space_id drop not null;
alter table goals add column if not exists category_id text null;
