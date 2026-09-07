-- ROLES ---------------------------------------------------------------
create type public.app_role as enum ('buyer', 'seller', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Sabihub user',
  tier smallint not null default 1,
  verification_status text not null default 'unverified',
  probation_until timestamptz,
  frozen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users can read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Admins can read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- shared updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.update_updated_at_column();

-- signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Sabihub user')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'buyer')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- HUBS ----------------------------------------------------------------
create table public.hubs (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  name text not null,
  address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.hubs to anon, authenticated;
grant all on public.hubs to service_role;
alter table public.hubs enable row level security;
create policy "Hubs are viewable by everyone" on public.hubs for select using (true);
create policy "Admins manage hubs" on public.hubs for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger hubs_updated_at before update on public.hubs
for each row execute function public.update_updated_at_column();

-- LISTINGS ------------------------------------------------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete set null,
  seller_name text not null,
  seller_verified boolean not null default false,
  title text not null,
  category text not null,
  reserve_price bigint not null,
  current_bid bigint not null,
  bid_count integer not null default 0,
  ends_at timestamptz not null,
  status text not null default 'draft',
  hub_city text not null,
  cover_color text not null default '280 60% 55%',
  images text[] not null default '{}',
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.listings to authenticated;
grant select on public.listings to anon;
grant all on public.listings to service_role;
alter table public.listings enable row level security;
create policy "Public can view live listings" on public.listings for select using (status in ('active', 'sold'));
create policy "Sellers can view own listings" on public.listings for select to authenticated using (auth.uid() = seller_id);
create policy "Admins can view all listings" on public.listings for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Sellers can create listings" on public.listings for insert to authenticated with check (auth.uid() = seller_id);
create policy "Sellers can update own listings" on public.listings for update to authenticated using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create trigger listings_updated_at before update on public.listings
for each row execute function public.update_updated_at_column();
create index listings_status_ends_at_idx on public.listings (status, ends_at);
create index listings_seller_idx on public.listings (seller_id);

-- BIDS ----------------------------------------------------------------
create table public.bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  bidder_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null,
  placed_at timestamptz not null default now()
);
grant select on public.bids to anon, authenticated;
grant all on public.bids to service_role;
alter table public.bids enable row level security;
create policy "Bid history is public" on public.bids for select using (true);
create index bids_listing_idx on public.bids (listing_id, placed_at desc);

-- atomic bid placement
create or replace function public.place_bid(_listing_id uuid, _bidder uuid, _amount bigint)
returns public.listings
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.listings;
begin
  select * into l from public.listings where id = _listing_id for update;
  if l.id is null then raise exception 'listing_not_found'; end if;
  if l.status <> 'active' then raise exception 'auction_not_active'; end if;
  if l.ends_at <= now() then raise exception 'auction_ended'; end if;
  if l.seller_id = _bidder then raise exception 'seller_cannot_bid'; end if;
  if _amount < l.current_bid + 5000 then raise exception 'bid_too_low'; end if;

  insert into public.bids (listing_id, bidder_id, amount) values (_listing_id, _bidder, _amount);

  update public.listings
     set current_bid = _amount,
         bid_count = bid_count + 1,
         ends_at = case when ends_at - now() < interval '2 minutes' then now() + interval '2 minutes' else ends_at end
   where id = _listing_id
  returning * into l;

  return l;
end;
$$;

-- ORDERS --------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  listing_title text not null,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid references auth.users(id) on delete set null,
  seller_name text not null,
  hub_city text not null,
  winning_bid bigint not null,
  buyer_protection_fee bigint not null,
  total_due bigint not null,
  status text not null default 'awaiting_payment',
  virtual_account_bank text not null,
  virtual_account_number text not null,
  virtual_account_name text not null,
  funded_at timestamptz,
  release_due_at timestamptz,
  released_at timestamptz,
  disputed_at timestamptz,
  dispute_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Buyers and sellers can view their orders" on public.orders for select to authenticated using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Admins can view all orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Buyers can create their orders" on public.orders for insert to authenticated with check (auth.uid() = buyer_id);
create policy "Buyers can update their orders" on public.orders for update to authenticated using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);
create policy "Admins can update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger orders_updated_at before update on public.orders
for each row execute function public.update_updated_at_column();

-- VERIFICATION --------------------------------------------------------
create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier smallint not null default 1,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.verification_requests to authenticated;
grant all on public.verification_requests to service_role;
alter table public.verification_requests enable row level security;
create policy "Users can view own verification requests" on public.verification_requests for select to authenticated using (auth.uid() = user_id);
create policy "Users can create own verification requests" on public.verification_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins can view all verification requests" on public.verification_requests for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update verification requests" on public.verification_requests for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger verification_requests_updated_at before update on public.verification_requests
for each row execute function public.update_updated_at_column();

-- SEED ----------------------------------------------------------------
insert into public.hubs (city, name, address) values
  ('Lagos', 'Yaba Hub', 'Herbert Macaulay Way'),
  ('Lagos', 'Lekki Hub', 'Admiralty Way, Phase 1'),
  ('Abuja', 'Wuse Hub', 'Aminu Kano Crescent'),
  ('Port Harcourt', 'GRA Hub', 'Aba Road'),
  ('Ibadan', 'Bodija Hub', 'Awolowo Avenue'),
  ('Kano', 'Sabon Gari Hub', 'Fagge District');

insert into public.listings (seller_name, seller_verified, title, category, reserve_price, current_bid, bid_count, ends_at, status, hub_city, cover_color, images, video_url) values
  ('Tunde M.', true, 'iPhone 15 Pro — 256GB Titanium Blue', 'Phones', 700000, 742000, 14, now() + interval '2 hours 14 minutes', 'active', 'Lagos', '280 60% 55%',
    array['https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=70'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
  ('Ngozi A.', true, 'Sony PlayStation 5 Slim + 2 controllers', 'Gaming', 380000, 415000, 22, now() + interval '6 hours', 'active', 'Abuja', '220 65% 55%',
    array['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?auto=format&fit=crop&w=1200&q=70'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
  ('Kelechi B.', true, 'MacBook Air M2 — 512GB Midnight', 'Laptops', 900000, 960000, 9, now() + interval '24 hours', 'active', 'Port Harcourt', '155 40% 45%',
    array['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=70'],
    null),
  ('Amina S.', true, 'Canon EOS R6 Mark II + 24-105mm lens', 'Cameras', 1600000, 1720000, 6, now() + interval '3 hours', 'active', 'Lagos', '310 55% 50%',
    array['https://images.unsplash.com/photo-1519183071298-a2962be96f83?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=1200&q=70'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
  ('Ifeanyi P.', true, 'Rolex Oyster Perpetual 41 — 2022', 'Watches', 5800000, 6100000, 4, now() + interval '12 hours', 'active', 'Abuja', '45 70% 55%',
    array['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1548171915-e79a380a2a4b?auto=format&fit=crop&w=1200&q=70'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
  ('Chidi K.', true, 'DJI Mavic 3 Pro Fly More Combo', 'Drones', 2100000, 2240000, 11, now() + interval '8 hours', 'active', 'Ibadan', '200 55% 50%',
    array['https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=70'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
