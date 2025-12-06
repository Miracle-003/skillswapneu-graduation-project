-- Create minimal auth tables managed by Prisma in public schema
-- Note: Supabase auth tables are NOT created here. This only creates our app tables.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  avatar_url text,
  email_verified_at timestamptz,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  token_id text not null unique,
  secret_hash text not null,
  user_id uuid not null,
  email text not null,
  link_url text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint fk_evt_user foreign key (user_id) references public.app_users(id) on delete cascade on update no action
);

create index if not exists idx_email_verification_tokens_user on public.email_verification_tokens(user_id);
create index if not exists idx_email_verification_tokens_expires on public.email_verification_tokens(expires_at);
