-- AutoTransport Dashboard — Supabase Schema
-- Run this in Supabase SQL Editor to create all tables

-- ─── Orders ────────────────────────────────────────
create table if not exists orders (
  id text primary key default gen_random_uuid()::text,
  order_number text not null unique,
  status text not null default 'booked' check (status in ('booked','dispatched','picked_up','in_transit','delivered')),
  customer_name text not null,
  customer_email text not null default '',
  customer_phone text not null default '',
  vehicle_year int not null default 2024,
  vehicle_make text not null default '',
  vehicle_model text not null default '',
  vehicle_vin text not null default '',
  vehicle_condition text not null default 'running' check (vehicle_condition in ('running','not_running')),
  origin_city text not null default '',
  origin_state text not null default '',
  origin_zip text not null default '',
  destination_city text not null default '',
  destination_state text not null default '',
  destination_zip text not null default '',
  distance_miles int not null default 0,
  carrier_id text,
  carrier_name text,
  driver_name text,
  driver_phone text,
  price numeric not null default 0,
  deposit numeric not null default 0,
  balance_due numeric not null default 0,
  is_paid boolean not null default false,
  stripe_payment_id text,
  hubspot_deal_id text,
  central_dispatch_id text,
  pickup_date timestamptz,
  delivery_date timestamptz,
  estimated_delivery timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at desc);

-- ─── Carriers ──────────────────────────────────────
create table if not exists carriers (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  mc_number text not null default '',
  dot_number text not null default '',
  contact_name text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  rating numeric not null default 0,
  total_deliveries int not null default 0,
  on_time_percentage int not null default 0,
  insurance_expiry timestamptz,
  created_at timestamptz not null default now()
);

-- ─── Notifications ─────────────────────────────────
create table if not exists notifications (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references orders(id) on delete cascade,
  order_number text not null,
  type text not null check (type in ('sms','email')),
  recipient text not null,
  subject text not null default '',
  message text not null default '',
  status text not null default 'pending' check (status in ('sent','failed','pending')),
  provider text not null default 'resend' check (provider in ('twilio','sendgrid','resend')),
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_order_id on notifications(order_id);
create index if not exists idx_notifications_created_at on notifications(created_at desc);

-- ─── Status History ────────────────────────────────
create table if not exists status_history (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references orders(id) on delete cascade,
  order_number text not null,
  from_status text,
  to_status text not null,
  changed_by text not null default 'System',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_status_history_order_id on status_history(order_id);
create index if not exists idx_status_history_created_at on status_history(created_at desc);

-- ─── Activity Feed ─────────────────────────────────
create table if not exists activities (
  id text primary key default gen_random_uuid()::text,
  type text not null check (type in ('status_change','payment','notification','new_order')),
  title text not null,
  description text not null default '',
  order_id text not null,
  order_number text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_created_at on activities(created_at desc);

-- ─── RLS Policies (permissive for internal dashboard) ──
alter table orders enable row level security;
alter table carriers enable row level security;
alter table notifications enable row level security;
alter table status_history enable row level security;
alter table activities enable row level security;

create policy "Allow all for anon" on orders for all using (true) with check (true);
create policy "Allow all for anon" on carriers for all using (true) with check (true);
create policy "Allow all for anon" on notifications for all using (true) with check (true);
create policy "Allow all for anon" on status_history for all using (true) with check (true);
create policy "Allow all for anon" on activities for all using (true) with check (true);
