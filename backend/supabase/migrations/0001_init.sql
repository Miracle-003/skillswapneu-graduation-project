-- Initial schema for skill swap (Supabase Postgres)
-- Run this in Supabase SQL editor (or supabase CLI) before using the app.

create extension if not exists pgcrypto;

-- Helper to maintain updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- 1) Profiles
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  major text,
  year text,
  bio text,
  learning_style text,
  study_preference text,
  courses text[] not null default '{}',
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

-- 2) Connections
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id_1 uuid not null references public.user_profiles(user_id) on delete cascade,
  user_id_2 uuid not null references public.user_profiles(user_id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (user_id_1, user_id_2)
);
create index if not exists idx_connections_user1 on public.connections(user_id_1);
create index if not exists idx_connections_user2 on public.connections(user_id_2);

-- 3) Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.user_profiles(user_id) on delete cascade,
  receiver_id uuid not null references public.user_profiles(user_id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
create index if not exists idx_messages_created on public.messages(created_at);

-- 4) Peer review submissions
create table if not exists public.peer_review_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(user_id) on delete cascade,
  title text not null,
  description text not null,
  course text not null,
  file_url text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists idx_prs_user on public.peer_review_submissions(user_id);
create index if not exists idx_prs_status on public.peer_review_submissions(status);
create index if not exists idx_prs_created on public.peer_review_submissions(created_at);

-- 5) Peer reviews
create table if not exists public.peer_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.peer_review_submissions(id) on delete cascade,
  reviewer_id uuid not null references public.user_profiles(user_id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now(),
  unique (submission_id, reviewer_id)
);
create index if not exists idx_pr_submission on public.peer_reviews(submission_id);
create index if not exists idx_pr_reviewer on public.peer_reviews(reviewer_id);

-- RLS
alter table public.user_profiles enable row level security;
alter table public.connections enable row level security;
alter table public.messages enable row level security;
alter table public.peer_review_submissions enable row level security;
alter table public.peer_reviews enable row level security;

-- Profiles: anyone signed-in can read; only owner can insert/update
create policy if not exists "profiles_select_auth" on public.user_profiles for select using (auth.uid() is not null);
create policy if not exists "profiles_insert_self" on public.user_profiles for insert with check (auth.uid() = user_id);
create policy if not exists "profiles_update_self" on public.user_profiles for update using (auth.uid() = user_id);

-- Connections: visible to either side; creator inserts; either can update
create policy if not exists "connections_select_participants" on public.connections for select using (
  auth.uid() = user_id_1 or auth.uid() = user_id_2
);
create policy if not exists "connections_insert_creator" on public.connections for insert with check (
  auth.uid() = user_id_1
);
create policy if not exists "connections_update_participants" on public.connections for update using (
  auth.uid() = user_id_1 or auth.uid() = user_id_2
);

-- Messages: sender or receiver
create policy if not exists "messages_select_participants" on public.messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
create policy if not exists "messages_insert_sender" on public.messages for insert with check (
  auth.uid() = sender_id
);

-- Submissions: everyone signed-in can read, only owner can write
create policy if not exists "prs_select_auth" on public.peer_review_submissions for select using (auth.uid() is not null);
create policy if not exists "prs_insert_owner" on public.peer_review_submissions for insert with check (auth.uid() = user_id);
create policy if not exists "prs_update_owner" on public.peer_review_submissions for update using (auth.uid() = user_id);

-- Reviews: everyone signed-in can read, reviewer writes
create policy if not exists "pr_select_auth" on public.peer_reviews for select using (auth.uid() is not null);
create policy if not exists "pr_insert_reviewer" on public.peer_reviews for insert with check (auth.uid() = reviewer_id);

-- Realtime for chat
alter publication supabase_realtime add table public.messages;
