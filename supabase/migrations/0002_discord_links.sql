-- Links a user's Supabase account to a Discord user id, so the Discord bot
-- (running with the service role key, no browser session) knows whose
-- finance data to read/write. Run this after 0001_init.sql.

create table if not exists public.link_codes (
  code text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists public.discord_links (
  discord_user_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.link_codes enable row level security;
alter table public.discord_links enable row level security;

-- The web app (cookie-authenticated client) can create and read its own codes.
create policy "link_codes_owner" on public.link_codes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- The web app can check whether it's linked; only the service role (the
-- Discord bot, after verifying a code) is allowed to create a link.
create policy "discord_links_select_own" on public.discord_links
  for select using (auth.uid() = user_id);
