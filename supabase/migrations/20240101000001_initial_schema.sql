-- ============================================================
-- Personal OS — Initial Schema
-- ============================================================

-- ─── user_profiles ──────────────────────────────────────────
create table if not exists public.user_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  location      text,
  timezone      text,
  bio           text,
  anthropic_api_key text,
  created_at    timestamptz not null default now(),
  unique (user_id)
);

alter table public.user_profiles enable row level security;

create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.user_profiles for delete
  using (auth.uid() = user_id);

-- ─── journal_templates ──────────────────────────────────────
create table if not exists public.journal_templates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  structure  jsonb,
  created_at timestamptz not null default now()
);

alter table public.journal_templates enable row level security;

create policy "Users can manage their own templates"
  on public.journal_templates for all
  using (auth.uid() = user_id);

-- ─── journal_entries ────────────────────────────────────────
create table if not exists public.journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.journal_templates(id) on delete set null,
  title       text not null,
  content     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create policy "Users can manage their own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id);

-- ─── wheel_categories ───────────────────────────────────────
create table if not exists public.wheel_categories (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  name      text not null,
  is_custom boolean not null default false,
  is_active boolean not null default true
);

alter table public.wheel_categories enable row level security;

create policy "Users can manage their own wheel categories"
  on public.wheel_categories for all
  using (auth.uid() = user_id);

-- ─── wheel_checkins ─────────────────────────────────────────
create table if not exists public.wheel_checkins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null default current_date,
  scores     jsonb not null default '{}',
  notes      text,
  created_at timestamptz not null default now()
);

alter table public.wheel_checkins enable row level security;

create policy "Users can manage their own checkins"
  on public.wheel_checkins for all
  using (auth.uid() = user_id);

-- ─── goals ──────────────────────────────────────────────────
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.wheel_categories(id) on delete set null,
  title       text not null,
  description text,
  status      text not null default 'active' check (status in ('active', 'completed', 'archived')),
  target_date date,
  created_at  timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users can manage their own goals"
  on public.goals for all
  using (auth.uid() = user_id);

-- ─── tasks ──────────────────────────────────────────────────
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  goal_id     uuid references public.goals(id) on delete cascade,
  category_id uuid references public.wheel_categories(id) on delete set null,
  title       text not null,
  completed   boolean not null default false,
  due_date    date,
  created_at  timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users can manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

-- ─── Auto-create user profile on signup ─────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Auto-seed default wheel categories on signup ───────────
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.wheel_categories (user_id, name, is_custom, is_active)
  values
    (new.id, 'Health', false, true),
    (new.id, 'Career', false, true),
    (new.id, 'Finance', false, true),
    (new.id, 'Relationships', false, true),
    (new.id, 'Personal Growth', false, true),
    (new.id, 'Fun', false, true),
    (new.id, 'Environment', false, true),
    (new.id, 'Family/Friends', false, true);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_categories on auth.users;
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute function public.seed_default_categories();

-- ─── delete_user RPC (for account deletion) ─────────────────
create or replace function public.delete_user()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

-- ─── updated_at auto-timestamp for journal entries ───────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();
