-- Add cover_url to goals table for Pexels cover images
alter table goals add column if not exists cover_url text null;
