-- Tyre Shop Management Web Application Schema (Multi-tenant)

-- Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- Drop existing tables to apply new schema (WARNING: This will wipe existing data)
drop table if exists stock_log cascade;
drop table if exists bill_items cascade;
drop table if exists bills cascade;
drop table if exists products cascade;
drop table if exists suppliers cascade;
drop table if exists settings cascade;

-- TABLE: suppliers
create table suppliers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null default auth.uid(),
    name text not null,
    phone text,
    email text,
    address text,
    gst_number text,
    created_at timestamptz default now()
);

-- TABLE: products
create table products (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null default auth.uid(),
    name text not null,
    brand text,
    size text,
    type text,
    category text,
    sku text,
    purchase_price numeric,
    selling_price numeric,
    stock_qty integer default 0,
    low_stock_threshold integer default 5,
    supplier_id uuid references suppliers(id),
    hsn_code text,
    created_at timestamptz default now(),
    unique (user_id, sku)
);

-- TABLE: bills
create table bills (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null default auth.uid(),
    bill_number text,
    customer_name text,
    customer_phone text,
    vehicle_number text,
    subtotal numeric,
    discount_type text,
    discount_value numeric,
    gst_rate numeric,
    gst_amount numeric,
    grand_total numeric,
    created_at timestamptz default now(),
    unique (user_id, bill_number)
);

-- TABLE: bill_items
create table bill_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null default auth.uid(),
    bill_id uuid references bills(id) on delete cascade,
    product_id uuid references products(id),
    product_name text,
    hsn_code text,
    quantity integer,
    unit_price numeric,
    gst_rate numeric,
    line_total numeric
);

-- TABLE: stock_log
create table stock_log (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null default auth.uid(),
    product_id uuid references products(id),
    change_qty integer,
    reason text,
    note text,
    created_at timestamptz default now()
);

-- TABLE: settings
create table settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null default auth.uid() unique,
    shop_name text,
    owner_name text,
    address text,
    phone text,
    email text,
    gstin text,
    logo_base64 text,
    default_gst_rate numeric default 18,
    low_stock_default integer default 5
);

-- RLS Policies (Isolate data per user)
alter table suppliers enable row level security;
alter table products enable row level security;
alter table bills enable row level security;
alter table bill_items enable row level security;
alter table stock_log enable row level security;
alter table settings enable row level security;

-- Create policies for isolated access based on auth.uid()
create policy "Users can only access their own suppliers" on suppliers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can only access their own products" on products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can only access their own bills" on bills for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can only access their own bill_items" on bill_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can only access their own stock_log" on stock_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can only access their own settings" on settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Real-time
alter publication supabase_realtime add table products;
