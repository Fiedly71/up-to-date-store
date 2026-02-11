-- Supabase SQL for orders table
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  product_id text not null,
  product_title text not null,
  price numeric not null,
  image_url text,
  status text default 'pending',
  created_at timestamptz default now(),
  user_email text,
  shipping_address text
);
