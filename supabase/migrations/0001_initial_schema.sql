-- Eliza Moreira Tattoo — esquema inicial
-- Todas as tabelas têm RLS. Clientes só veem os próprios dados; a Eliza (role = 'admin') vê tudo.

create schema if not exists private;

-- ---------------------------------------------------------------- perfis
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client', 'admin')),
  referral_code text not null unique,
  referred_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.profiles (referred_by);

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

-- cria o perfil (com código de referência único) quando alguém se regista
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_code text;
  v_ref uuid;
begin
  loop
    v_code := upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.profiles where referral_code = v_code);
  end loop;
  select id into v_ref from public.profiles
    where referral_code = upper(nullif(new.raw_user_meta_data ->> 'ref', ''));
  insert into public.profiles (id, full_name, referral_code, referred_by)
    values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), v_code, v_ref);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------- ficha de anamnese (dados de saúde)
create table public.anamnese_forms (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  full_name text not null,
  birth_date date not null,
  contact text not null,
  allergies text not null,
  health_notes text not null,
  idea text not null,
  reference_path text,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on public.anamnese_forms (client_id);

-- ---------------------------------------------------------------- sessões (cada sessão = 1 selo)
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  created_at timestamptz not null default now()
);
create index on public.sessions (client_id);

-- ---------------------------------------------------------------- agenda
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles (id) on delete set null,
  client_name text not null,
  starts_at timestamptz not null,
  zone text,
  created_at timestamptz not null default now()
);
create index on public.appointments (starts_at);
create index on public.appointments (client_id);

-- ---------------------------------------------------------------- mapa corporal
create table public.tattoos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  zone text not null,
  pain_level smallint not null check (pain_level between 1 and 3),
  photo_path text,
  created_at timestamptz not null default now(),
  unique (client_id, zone)
);

-- ---------------------------------------------------------------- tickets e mensagens
create table public.tickets (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  subject text not null default 'cuidados pós-tattoo',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);
create index on public.tickets (client_id);
create index on public.tickets (session_id);

create table public.messages (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.tickets (id) on delete cascade,
  sender_id uuid default auth.uid() references public.profiles (id) on delete set null,
  sender_role text not null check (sender_role in ('client', 'agent', 'eliza')),
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index on public.messages (ticket_id);
create index on public.messages (sender_id);

-- depois de cada sessão abre-se um ticket de cuidados pós-tattoo
create function private.open_ticket_after_session() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.tickets (client_id, session_id) values (new.client_id, new.id);
  return new;
end;
$$;
create trigger on_session_created after insert on public.sessions
  for each row execute function private.open_ticket_after_session();

-- ---------------------------------------------------------------- feedback
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  client_id uuid default auth.uid() references public.profiles (id) on delete set null,
  source text not null default 'site' check (source in ('site', 'google')),
  author text not null,
  stars smallint not null check (stars between 1 and 5),
  body text not null,
  created_at timestamptz not null default now()
);
create index on public.feedback (client_id);

-- ---------------------------------------------------------------- permissões
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant usage on schema private to authenticated;
revoke execute on all functions in schema private from public, anon;
grant execute on function private.is_admin() to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select, insert, delete on public.anamnese_forms to authenticated;
grant select, insert, update, delete on public.sessions, public.appointments, public.tattoos, public.feedback to authenticated;
grant select, insert, update on public.tickets to authenticated;
grant select, insert on public.messages to authenticated;

alter table public.profiles enable row level security;
alter table public.anamnese_forms enable row level security;
alter table public.sessions enable row level security;
alter table public.appointments enable row level security;
alter table public.tattoos enable row level security;
alter table public.tickets enable row level security;
alter table public.messages enable row level security;
alter table public.feedback enable row level security;

create policy "ver o próprio perfil ou admin" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy "editar o próprio nome" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "ver a própria ficha ou admin" on public.anamnese_forms for select to authenticated
  using (client_id = (select auth.uid()) or (select private.is_admin()));
create policy "enviar a própria ficha" on public.anamnese_forms for insert to authenticated
  with check (client_id = (select auth.uid()));
create policy "apagar a própria ficha ou admin" on public.anamnese_forms for delete to authenticated
  using (client_id = (select auth.uid()) or (select private.is_admin()));

create policy "ver as próprias sessões ou admin" on public.sessions for select to authenticated
  using (client_id = (select auth.uid()) or (select private.is_admin()));
create policy "admin cria sessões" on public.sessions for insert to authenticated with check ((select private.is_admin()));
create policy "admin edita sessões" on public.sessions for update to authenticated using ((select private.is_admin()));
create policy "admin apaga sessões" on public.sessions for delete to authenticated using ((select private.is_admin()));

create policy "ver as próprias marcações ou admin" on public.appointments for select to authenticated
  using (client_id = (select auth.uid()) or (select private.is_admin()));
create policy "admin cria marcações" on public.appointments for insert to authenticated with check ((select private.is_admin()));
create policy "admin edita marcações" on public.appointments for update to authenticated using ((select private.is_admin()));
create policy "admin apaga marcações" on public.appointments for delete to authenticated using ((select private.is_admin()));

create policy "ver o próprio mapa ou admin" on public.tattoos for select to authenticated
  using (client_id = (select auth.uid()) or (select private.is_admin()));
create policy "registar no próprio mapa" on public.tattoos for insert to authenticated
  with check (client_id = (select auth.uid()));
create policy "editar o próprio mapa" on public.tattoos for update to authenticated
  using (client_id = (select auth.uid())) with check (client_id = (select auth.uid()));
create policy "apagar do próprio mapa" on public.tattoos for delete to authenticated
  using (client_id = (select auth.uid()));

create policy "ver os próprios tickets ou admin" on public.tickets for select to authenticated
  using (client_id = (select auth.uid()) or (select private.is_admin()));
create policy "admin cria tickets" on public.tickets for insert to authenticated with check ((select private.is_admin()));
create policy "admin edita tickets" on public.tickets for update to authenticated using ((select private.is_admin()));

create policy "ver mensagens dos próprios tickets ou admin" on public.messages for select to authenticated
  using ((select private.is_admin()) or exists (
    select 1 from public.tickets t where t.id = ticket_id and t.client_id = (select auth.uid())));
create policy "escrever nos próprios tickets abertos ou admin" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and (
    (sender_role = 'eliza' and (select private.is_admin()))
    or (sender_role = 'client' and exists (
      select 1 from public.tickets t
      where t.id = ticket_id and t.client_id = (select auth.uid()) and t.status = 'open'))));

create policy "admin vê feedback" on public.feedback for select to authenticated using ((select private.is_admin()));
create policy "cliente envia feedback do site ou admin" on public.feedback for insert to authenticated
  with check ((select private.is_admin()) or (client_id = (select auth.uid()) and source = 'site'));
create policy "admin apaga feedback" on public.feedback for delete to authenticated using ((select private.is_admin()));

-- ---------------------------------------------------------------- ficheiros (privados)
-- caminho: <id do cliente>/<ficheiro>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('referencias', 'referencias', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('tatuagens', 'tatuagens', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "em: ver os próprios ficheiros ou admin" on storage.objects for select to authenticated
  using (bucket_id in ('referencias', 'tatuagens')
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
create policy "em: carregar para a própria pasta" on storage.objects for insert to authenticated
  with check (bucket_id in ('referencias', 'tatuagens') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "em: apagar os próprios ficheiros" on storage.objects for delete to authenticated
  using (bucket_id in ('referencias', 'tatuagens') and (storage.foldername(name))[1] = (select auth.uid())::text);
