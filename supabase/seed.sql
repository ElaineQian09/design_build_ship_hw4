insert into public.cities (name, country, latitude, longitude, timezone)
values
  ('Chicago', 'USA', 41.87810, -87.62980, 'America/Chicago'),
  ('New York', 'USA', 40.71280, -74.00600, 'America/New_York'),
  ('Los Angeles', 'USA', 34.05220, -118.24370, 'America/Los_Angeles'),
  ('London', 'UK', 51.50720, -0.12760, 'Europe/London'),
  ('Tokyo', 'Japan', 35.67620, 139.65030, 'Asia/Tokyo')
on conflict (name, country) do nothing;
