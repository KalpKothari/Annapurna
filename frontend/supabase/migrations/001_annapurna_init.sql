create extension if not exists pgcrypto;

create table if not exists roles (
  id integer generated always as identity primary key,
  name text not null unique,
  description text default '',
  type text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into roles (name, description, type)
values ('Authenticated', 'Default authenticated role', 'authenticated')
on conflict (type) do nothing;

create table if not exists users (
  id bigint generated always as identity primary key,
  username text not null unique,
  email text not null unique,
  password text,
  confirmed boolean not null default true,
  blocked boolean not null default false,
  role_id integer not null default 1 references roles(id),
  clerk_id text unique,
  first_name text default '',
  last_name text default '',
  image_url text default '',
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table users
  alter column role_id set default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_role_id_fkey'
      and conrelid = 'users'::regclass
  ) then
    alter table users
      add constraint users_role_id_fkey
      foreign key (role_id)
      references roles(id);
  end if;
end $$;

create table if not exists recipes (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  cuisine text,
  category text,
  ingredients jsonb not null,
  instructions jsonb not null,
  image_url text default '',
  is_public boolean not null default false,
  author_id bigint references users(id) on delete set null,
  prep_time integer,
  cook_time integer,
  servings integer,
  nutrition jsonb,
  tips jsonb,
  substitutions jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz default now()
);

create table if not exists pantry_items (
  id bigint generated always as identity primary key,
  name text not null,
  quantity text,
  image_url text default '',
  owner_id bigint not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz default now()
);

create table if not exists saved_recipes (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  recipe_id bigint not null references recipes(id) on delete cascade,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz default now(),
  unique (user_id, recipe_id)
);

create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cuisines (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists featured_recipes (
  id bigint generated always as identity primary key,
  recipe_id bigint not null references recipes(id) on delete cascade,
  rank integer default 0,
  created_at timestamptz not null default now(),
  unique (recipe_id)
);

create index if not exists idx_users_clerk_id on users(clerk_id);
create index if not exists idx_recipes_title_ci on recipes(lower(title));
create index if not exists idx_recipes_author_id on recipes(author_id);
create index if not exists idx_pantry_items_owner_id on pantry_items(owner_id);
create index if not exists idx_saved_recipes_user_id on saved_recipes(user_id);
create index if not exists idx_saved_recipes_recipe_id on saved_recipes(recipe_id);
