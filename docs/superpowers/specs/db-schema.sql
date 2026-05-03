create table bookings (
  id          uuid primary key default gen_random_uuid(),
  house       text not null check (house in ('small', 'large')),
  start_date  date not null,
  end_date    date not null,
  note        text,
  created_at  timestamptz default now(),
  check (end_date >= start_date)
);

create index bookings_house_dates_idx on bookings (house, start_date, end_date);

alter table bookings enable row level security;

create policy "anyone can read"
  on bookings for select
  using (true);

create policy "only owner can write"
  on bookings for all
  using ((select auth.email()) = 'queenhouse.arm@gmail.com')
  with check ((select auth.email()) = 'queenhouse.arm@gmail.com');
