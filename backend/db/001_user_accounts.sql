-- Create a public mirror table of auth.users for safe reads from anon key
create table if not exists public.user_accounts (
  id uuid primary key,
  email text,
  created_at timestamptz not null default now(),
  raw_user_meta jsonb
);

-- Allow read access to anon (adjust RLS as needed for your project)
alter table public.user_accounts enable row level security;
create policy if not exists "Allow read to all" on public.user_accounts for select using (true);

-- Function to mirror new auth users
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.user_accounts (id, email, created_at, raw_user_meta)
  values (new.id, new.email, new.created_at, to_jsonb(new));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();
