-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
-- Links to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  companyName text,
  role text check (role in ('client', 'supplier', 'admin')),
  phone text,
  cpf text,
  cnpj text,
  address jsonb,
  categories text[],
  latitude float8,
  longitude float8,
  created_at timestamptz default now()
);
alter table profiles enable row level security;

-- STORES
create table if not exists public.stores (
  id uuid default uuid_generate_v4() primary key,
  supplier_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  address_json jsonb,
  latitude float8,
  longitude float8,
  active boolean default true,
  image text,
  delivery_fee_base numeric default 5.00,
  delivery_price_per_km numeric default 1.50,
  free_delivery_radius numeric default 0,
  created_at timestamptz default now()
);
alter table stores enable row level security;

-- PRODUCTS
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade,
  supplier_id uuid references public.profiles(id),
  name text not null,
  description text,
  price numeric not null,
  unit text,
  image text,
  active boolean default true,
  stock_quantity integer default 0,
  category text,
  created_at timestamptz default now()
);
alter table products enable row level security;

-- ORDERS
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.profiles(id),
  supplier_id uuid references public.profiles(id),
  total_amount numeric default 0,
  status text default 'PENDING',
  delivery_address jsonb,
  payment_method text,
  created_at timestamptz default now()
);
alter table orders enable row level security;

-- ORDER ITEMS
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity numeric default 1,
  unit_price numeric default 0
);
alter table order_items enable row level security;

-- APP CONFIG
create table if not exists public.app_config (
  id uuid default uuid_generate_v4() primary key,
  maintenance_mode boolean default false,
  min_version text default '1.0.0'
);
alter table app_config enable row level security;
create policy "Public read config" on app_config for select using (true);

-- RLS POLICIES

-- Profiles
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Anyone can read supplier profiles" on profiles for select using (role = 'supplier');

-- Stores
create policy "Suppliers can insert stores" on stores for insert with check (auth.uid() = supplier_id);
create policy "Suppliers can update own stores" on stores for update using (auth.uid() = supplier_id);
create policy "Public can read active stores" on stores for select using (active = true);

-- Products
create policy "Suppliers can manage own products" on products for all using (auth.uid() = supplier_id);
create policy "Public can read active products" on products for select using (active = true);

-- Orders
create policy "Clients can create orders" on orders for insert with check (auth.uid() = client_id);
create policy "Clients can view own orders" on orders for select using (auth.uid() = client_id);
create policy "Suppliers can view assigned orders" on orders for select using (auth.uid() = supplier_id);
create policy "Suppliers can update status of assigned orders" on orders for update using (auth.uid() = supplier_id);

-- Order Items
create policy "Access via order" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and (orders.client_id = auth.uid() or orders.supplier_id = auth.uid()))
);
create policy "Insert via order owner" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.client_id = auth.uid())
);

-- FUNCTIONS

create or replace function calculate_delivery_info(store_id_param uuid, user_lat float8, user_lng float8)
returns json as $$
declare
  store_lat float8;
  store_lng float8;
  dist_km float8;
  fee numeric;
  base_fee numeric;
  per_km numeric;
begin
  select latitude, longitude, delivery_fee_base, delivery_price_per_km 
  into store_lat, store_lng, base_fee, per_km
  from stores where id = store_id_param;
  
  if store_lat is null or store_lng is null then
    return json_build_object('distance', 0, 'fee', 0, 'error', 'Store location not set');
  end if;

  -- Approximate distance calculation (Euclidean approximation for simplification without PostGIS)
  -- 1 degree lat ~= 111 km
  -- 1 degree lng ~= 111 km * cos(lat)
  dist_km := sqrt(power(store_lat - user_lat, 2) + power((store_lng - user_lng) * cos(radians((store_lat + user_lat)/2)), 2)) * 111.32;
  
  fee := base_fee + (dist_km * per_km);
  
  return json_build_object('distance', round(dist_km::numeric, 2), 'fee', round(fee, 2));
end;
$$ language plpgsql security definer;
