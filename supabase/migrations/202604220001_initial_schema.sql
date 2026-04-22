create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  latitude numeric(8, 5) not null,
  longitude numeric(8, 5) not null,
  timezone text not null,
  created_at timestamptz not null default now(),
  constraint cities_name_country_unique unique (name, country)
);

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_favorites_user_city_unique unique (user_id, city_id)
);

create table if not exists public.weather_readings (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  temperature numeric(5, 2),
  wind_speed numeric(6, 2),
  weather_code integer,
  observed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_favorites_user_id
  on public.user_favorites(user_id);

create index if not exists idx_user_favorites_city_id
  on public.user_favorites(city_id);

create index if not exists idx_weather_readings_city_id
  on public.weather_readings(city_id);

create index if not exists idx_weather_readings_observed_at_desc
  on public.weather_readings(observed_at desc);

create index if not exists idx_weather_readings_city_observed_at_desc
  on public.weather_readings(city_id, observed_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.user_favorites enable row level security;
alter table public.weather_readings enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "cities_select_authenticated" on public.cities;
create policy "cities_select_authenticated"
on public.cities
for select
to authenticated
using (true);

drop policy if exists "user_favorites_select_own" on public.user_favorites;
create policy "user_favorites_select_own"
on public.user_favorites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_favorites_insert_own" on public.user_favorites;
create policy "user_favorites_insert_own"
on public.user_favorites
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_favorites_update_own" on public.user_favorites;
create policy "user_favorites_update_own"
on public.user_favorites
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_favorites_delete_own" on public.user_favorites;
create policy "user_favorites_delete_own"
on public.user_favorites
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "weather_readings_select_authenticated" on public.weather_readings;
create policy "weather_readings_select_authenticated"
on public.weather_readings
for select
to authenticated
using (true);

alter publication supabase_realtime add table public.weather_readings;
