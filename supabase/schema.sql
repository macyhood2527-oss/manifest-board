create extension if not exists pgcrypto;

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  emoji text default '',
  theme text default '',
  cover_image_path text,
  sort_order bigint default extract(epoch from now())::bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manifests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  board_id uuid references public.boards(id) on delete set null,
  title text not null,
  notes text default '',
  category text default '',
  status text not null check (status in ('dreaming', 'planning', 'inspiration', 'achieved')),
  image_path text,
  achieved_at timestamptz,
  sort_order bigint default extract(epoch from now())::bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at
before update on public.boards
for each row
execute function public.set_updated_at();

drop trigger if exists set_manifests_updated_at on public.manifests;
create trigger set_manifests_updated_at
before update on public.manifests
for each row
execute function public.set_updated_at();

alter table public.boards enable row level security;
alter table public.manifests enable row level security;

drop policy if exists "Users can read their own boards" on public.boards;
create policy "Users can read their own boards"
on public.boards for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own boards" on public.boards;
create policy "Users can create their own boards"
on public.boards for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own boards" on public.boards;
create policy "Users can update their own boards"
on public.boards for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own boards" on public.boards;
create policy "Users can delete their own boards"
on public.boards for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their own manifests" on public.manifests;
create policy "Users can read their own manifests"
on public.manifests for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own manifests" on public.manifests;
create policy "Users can create their own manifests"
on public.manifests for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own manifests" on public.manifests;
create policy "Users can update their own manifests"
on public.manifests for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own manifests" on public.manifests;
create policy "Users can delete their own manifests"
on public.manifests for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('manifest-images', 'manifest-images', true),
  ('board-covers', 'board-covers', true)
on conflict (id) do nothing;

drop policy if exists "Public can view manifest images" on storage.objects;
create policy "Public can view manifest images"
on storage.objects for select
using (bucket_id = 'manifest-images');

drop policy if exists "Authenticated users can upload manifest images" on storage.objects;
create policy "Authenticated users can upload manifest images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'manifest-images'
  and auth.uid()::text = (storage.foldername(name))[2]
);

drop policy if exists "Authenticated users can update manifest images" on storage.objects;
create policy "Authenticated users can update manifest images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'manifest-images'
  and auth.uid()::text = (storage.foldername(name))[2]
)
with check (
  bucket_id = 'manifest-images'
  and auth.uid()::text = (storage.foldername(name))[2]
);

drop policy if exists "Authenticated users can delete manifest images" on storage.objects;
create policy "Authenticated users can delete manifest images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'manifest-images'
  and auth.uid()::text = (storage.foldername(name))[2]
);

drop policy if exists "Public can view board covers" on storage.objects;
create policy "Public can view board covers"
on storage.objects for select
using (bucket_id = 'board-covers');

drop policy if exists "Authenticated users can upload board covers" on storage.objects;
create policy "Authenticated users can upload board covers"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'board-covers'
  and auth.uid()::text = (storage.foldername(name))[2]
);

drop policy if exists "Authenticated users can update board covers" on storage.objects;
create policy "Authenticated users can update board covers"
on storage.objects for update
to authenticated
using (
  bucket_id = 'board-covers'
  and auth.uid()::text = (storage.foldername(name))[2]
)
with check (
  bucket_id = 'board-covers'
  and auth.uid()::text = (storage.foldername(name))[2]
);

drop policy if exists "Authenticated users can delete board covers" on storage.objects;
create policy "Authenticated users can delete board covers"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'board-covers'
  and auth.uid()::text = (storage.foldername(name))[2]
);
