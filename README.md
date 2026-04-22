# live-weather-board

Monorepo scaffold for Assignment 4.

## Apps

- `apps/web`: Next.js + Tailwind frontend for Vercel
- `apps/worker`: TypeScript Node.js worker for Railway

## Supabase

- Schema migration: `supabase/migrations/202604220001_initial_schema.sql`
- Seed data: `supabase/seed.sql`
- Realtime should be enabled on `public.weather_readings`

Apply in Supabase SQL Editor or with the Supabase CLI migration flow.

## Quick start

```bash
npm install
npm run dev:web
npm run dev:worker
```
