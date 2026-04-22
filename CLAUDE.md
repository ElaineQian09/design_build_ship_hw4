# Live Weather Board Architecture

## Goal
Build and deploy a multi-service system that polls live weather data, stores it in Supabase, and displays updates in real time on a frontend.

This project follows the required architecture:

External Data Source -> Background Worker (Railway) -> Supabase Database + Realtime -> Frontend (Next.js on Vercel)

## Project Choice
I chose to build a live weather dashboard using Open-Meteo as the external data source.

Users can:
- sign up and log in
- choose favorite cities
- view the latest weather for those cities
- see weather updates appear live without refreshing the page

## Services

### 1. Frontend (`apps/web`)
- Built with Next.js + Tailwind CSS
- Deployed on Vercel
- Uses Supabase Auth for sign up and login
- Reads favorite cities and latest weather data from Supabase
- Subscribes to Supabase Realtime to update the UI automatically

### 2. Worker (`apps/worker`)
- Built as a separate Node.js TypeScript service
- Deployed on Railway
- Polls the Open-Meteo API on a schedule
- Fetches current weather for tracked cities
- Writes fresh weather rows into Supabase

### 3. Database (`Supabase`)
Supabase is used for:
- Postgres database
- Auth
- Row Level Security
- Realtime updates

## Database Tables

### `profiles`
Stores user profile info.
- `id`
- `email`
- `created_at`

### `cities`
Stores supported cities and location info.
- `id`
- `name`
- `country`
- `latitude`
- `longitude`
- `timezone`
- `created_at`

### `user_favorites`
Stores which cities a user wants to follow.
- `id`
- `user_id`
- `city_id`
- `created_at`

### `weather_readings`
Stores weather snapshots written by the worker.
- `id`
- `city_id`
- `temperature`
- `windspeed`
- `weather_code`
- `observed_at`
- `created_at`

## Data Flow
1. A user signs up or logs in on the frontend.
2. The user selects favorite cities.
3. Favorites are stored in `user_favorites`.
4. The worker polls Open-Meteo for each city in `cities`.
5. The worker writes weather snapshots into `weather_readings`.
6. The frontend reads the latest weather for the logged-in user’s favorite cities.
7. The frontend subscribes to realtime inserts on `weather_readings`.
8. When new data is inserted, the UI updates without a refresh.

## Personalization
Users personalize the dashboard by selecting their own favorite cities.
Each user only manages their own favorites.

## Auth
Supabase Auth is used for:
- sign up
- sign in
- session management

## Security
Row Level Security policies ensure:
- users can only read or modify their own favorites
- authenticated users can read shared city/weather data
- worker writes use the service role key

## Realtime
Supabase Realtime is enabled on `weather_readings`.
The frontend listens for inserts and refreshes the displayed weather automatically.

## Deployment
- Frontend: Vercel
- Worker: Railway
- Database/Auth/Realtime: Supabase

## Environment Variables

### Frontend
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Worker
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Success Criteria
A complete submission should have:
- a working Vercel URL
- a running Railway worker
- weather data stored in Supabase
- realtime updates on the frontend
- authentication and personalization
- a public GitHub repository with commit history