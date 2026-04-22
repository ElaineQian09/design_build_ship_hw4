# CLAUDE.md

## 1. Goal

Build **Live Weather Board**, a multi-service web application that continuously ingests weather data from an external API and shows users a personalized live dashboard.

The project must strictly follow this architecture:

**External Data Source -> Background Worker (Railway) -> Supabase Database + Realtime -> Frontend (Next.js on Vercel)**

Core product goals:

- Users can sign up and log in with Supabase Auth.
- Users can choose and manage favorite cities.
- A background worker polls Open-Meteo every few minutes.
- The worker writes fresh weather data into Supabase.
- The frontend reads the latest stored weather data from Supabase.
- The frontend subscribes to Supabase Realtime so the UI updates without refresh.

This is not a direct client-to-weather-API architecture. The frontend must read from Supabase, not from Open-Meteo.

## 2. Services

### `apps/web`

Purpose:
- User-facing frontend
- Authentication UI
- Favorite city management
- Weather dashboard
- Realtime subscription handling

Technology:
- Next.js
- Tailwind CSS
- Supabase client SDK

Deployment target:
- Vercel

Responsibilities:
- Sign up, sign in, sign out
- Read the authenticated user session
- Read the user's favorite cities
- Query the latest weather rows for those cities
- Subscribe to realtime updates from Supabase
- Re-render the dashboard when new weather data arrives

### `apps/worker`

Purpose:
- Background ingestion service

Technology:
- Node.js
- TypeScript

Deployment target:
- Railway

Responsibilities:
- Run on an interval every few minutes
- Read the list of tracked cities from Supabase
- Fetch current weather for each city from Open-Meteo
- Normalize the external API response into the app's schema
- Write weather readings into Supabase

Important constraint:
- The worker is a separate service. It must not be merged into the Next.js app.

### `Supabase`

Purpose:
- Postgres database
- Authentication
- Row Level Security
- Realtime event delivery

Responsibilities:
- Store users, cities, favorites, and weather readings
- Enforce access control
- Publish inserts or updates for live frontend refresh behavior

### `Open-Meteo`

Purpose:
- External weather data source

Responsibilities:
- Provide weather data to the worker
- Remain external to the user-facing frontend

## 3. Database Tables

The schema should stay simple and aligned with the assignment.

### `profiles`

Purpose:
- Optional app-level user profile data tied to Supabase Auth users

Suggested columns:
- `id uuid primary key references auth.users(id)`
- `email text`
- `created_at timestamptz default now()`

### `cities`

Purpose:
- Canonical list of supported cities the app tracks

Suggested columns:
- `id uuid primary key`
- `name text not null`
- `country text`
- `latitude numeric not null`
- `longitude numeric not null`
- `timezone text`
- `created_at timestamptz default now()`

### `user_favorites`

Purpose:
- Join table connecting users to their selected cities

Suggested columns:
- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `city_id uuid not null references cities(id)`
- `created_at timestamptz default now()`

Suggested constraint:
- unique `(user_id, city_id)`

### `weather_readings`

Purpose:
- Time-series weather snapshots written by the worker

Suggested columns:
- `id uuid primary key`
- `city_id uuid not null references cities(id)`
- `temperature numeric`
- `wind_speed numeric`
- `weather_code integer`
- `observed_at timestamptz not null`
- `created_at timestamptz default now()`

Recommended behavior:
- Insert new rows over time rather than overwriting a single row
- Query the latest reading per city on the frontend

## 4. Data Flow

The required system flow is:

1. A user opens the frontend hosted on Vercel.
2. The user signs up or logs in using Supabase Auth.
3. The user selects favorite cities.
4. The frontend writes those favorites into `user_favorites`.
5. The Railway worker runs on a schedule every few minutes.
6. The worker reads tracked cities from the `cities` table.
7. The worker calls Open-Meteo for each city.
8. The worker transforms the API response into the app's database format.
9. The worker inserts fresh rows into `weather_readings`.
10. Supabase stores the rows and emits realtime events.
11. The frontend queries the latest readings for the signed-in user's favorite cities.
12. The frontend subscribes to Supabase Realtime on weather changes.
13. When new readings arrive, the dashboard updates without a page refresh.

Important architectural rule:
- The frontend never polls Open-Meteo directly.
- The worker is the only component that talks to the external weather API.

## 5. Personalization

Personalization is based on each user's selected favorite cities.

Expected behavior:
- Different users may favorite different cities.
- A logged-in user should see weather cards only for their own chosen cities.
- Favorite management should be user-specific and protected by Row Level Security.

This keeps the app personalized even though the underlying weather data is shared.

## 6. Auth

Authentication must use **Supabase Auth**.

Required capabilities:
- User sign up
- User log in
- User session persistence
- User log out

Access model:
- Authenticated users can manage their own rows in `user_favorites`.
- Authenticated users can read shared city data.
- Authenticated users can read weather data needed by the dashboard.
- The worker uses the Supabase service role key for trusted server-side writes.

Security expectations:
- Enable Row Level Security on app tables.
- Write policies so users cannot read or edit another user's favorites.
- Do not expose the service role key to the frontend.

## 7. Realtime

Realtime must be implemented with **Supabase Realtime**.

Expected behavior:
- The frontend subscribes to weather changes relevant to displayed cities.
- When the worker inserts a new weather row, the frontend receives the change event.
- The UI updates live without a manual refresh.

Recommended scope:
- Enable realtime for `weather_readings`
- Use inserts as the primary event type

Result:
- The dashboard behaves like a live board instead of a static page

## 8. Deployment

Deployment must mirror the required architecture.

### Frontend
- Platform: Vercel
- App: `apps/web`
- Role: Serve the Next.js frontend and connect to Supabase

### Worker
- Platform: Railway
- App: `apps/worker`
- Role: Execute scheduled background polling and database writes

### Database and Auth
- Platform: Supabase
- Role: Postgres, Auth, RLS, and Realtime

Deployment rule:
- Web and worker are separate deployable services
- Do not collapse the worker into Vercel cron functions if the assignment expects a separate worker service on Railway

## 9. Environment Variables

The environment should be split by service.

### Shared concept

Both apps need Supabase connection information, but with different security levels.

### Frontend (`apps/web`)

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Notes:
- These are safe for browser use
- The frontend must never receive `SUPABASE_SERVICE_ROLE_KEY`

### Worker (`apps/worker`)

Required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPEN_METEO_BASE_URL`
- `WORKER_POLL_INTERVAL_MINUTES`

Optional:
- `PORT`

Notes:
- The worker needs privileged write access to Supabase
- The worker may use a configurable polling interval for local development and deployment

## 10. Success Criteria

The project is successful when all of the following are true:

- The repo is structured as a monorepo with `apps/web` and `apps/worker`.
- The frontend is built with Next.js and Tailwind CSS.
- The worker is a separate TypeScript Node.js service.
- Supabase is used for database, auth, and realtime.
- Users can sign up and log in.
- Users can favorite cities.
- The worker polls Open-Meteo every few minutes.
- The worker writes weather data into Supabase.
- The frontend reads the latest stored weather data from Supabase.
- The frontend updates live through Supabase Realtime without requiring a page refresh.
- The frontend is deployed to Vercel.
- The worker is deployed to Railway.
- Secrets are separated correctly between frontend and worker.
- The system matches the required architecture exactly:

**External Data Source -> Background Worker (Railway) -> Supabase Database + Realtime -> Frontend (Next.js on Vercel)**

## Implementation Notes

Keep implementation decisions consistent with these project rules:

- Prefer a simple schema over premature abstraction.
- Treat `weather_readings` as append-only snapshots.
- Keep the worker responsible for all external API communication.
- Keep the frontend responsible for presentation, auth state, and realtime subscriptions.
- Use Supabase as the integration point between worker and frontend.
- Do not implement business logic in `CLAUDE.md`; use this file as the architectural contract for the project.
