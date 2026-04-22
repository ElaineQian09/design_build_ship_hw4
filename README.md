# live-weather-board

Live Weather Board is an Assignment 4 multi-service system built with this architecture:

**Open-Meteo -> Railway worker -> Supabase Database + Realtime -> Next.js frontend on Vercel**

## Monorepo

- `apps/web`: Next.js + Tailwind frontend
- `apps/worker`: TypeScript Node.js background worker
- `supabase`: schema migration and seed data

## Core Features

- Supabase Auth for sign up, log in, and protected dashboard access
- User-specific favorite cities with Row Level Security
- Railway worker polling Open-Meteo every few minutes
- Weather data stored in Supabase
- Supabase Realtime refreshing the dashboard without a manual page reload

## Environment Variables

Use the checked-in examples as templates:

- `./.env.example`
- `apps/web/.env.example`
- `apps/worker/.env.example`

Production variables should be added in:

- Vercel dashboard for `apps/web`
- Railway dashboard for `apps/worker`

## Supabase Setup

Run these files in Supabase SQL Editor:

1. `supabase/migrations/202604220001_initial_schema.sql`
2. `supabase/seed.sql`

Enable Realtime on `public.weather_readings`.

## Local Development

```bash
npm install
npm run dev:web
npm run dev:worker
```
