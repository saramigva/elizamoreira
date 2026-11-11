-- Horários livres da Eliza: horário semanal, dias fechados e duração de cada sessão.
-- As clientes veem os horários livres (sem ver as marcações de outras pessoas) através de available_slots().

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 1 and 7), -- 1 = segunda … 7 = domingo
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.blocked_dates (
  day date primary key,
  note text,
  created_at timestamptz not null default now()
);

create table public.booking_settings (
  id boolean primary key default true check (id),
  slot_minutes integer not null default 120 check (slot_minutes between 30 and 480)
);
insert into public.booking_settings default values;

alter table public.appointments
  add column duration_minutes integer not null default 120 check (duration_minutes between 15 and 720);
alter table public.anamnese_forms add column preferred_slot timestamptz;

grant select on public.availability, public.blocked_dates, public.booking_settings to authenticated;
grant insert, update, delete on public.availability, public.blocked_dates to authenticated;
grant update (slot_minutes) on public.booking_settings to authenticated;

alter table public.availability enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.booking_settings enable row level security;

create policy "todos veem o horário" on public.availability for select to authenticated using (true);
create policy "admin cria horário" on public.availability for insert to authenticated with check ((select private.is_admin()));
create policy "admin edita horário" on public.availability for update to authenticated using ((select private.is_admin()));
create policy "admin apaga horário" on public.availability for delete to authenticated using ((select private.is_admin()));

create policy "todos veem dias fechados" on public.blocked_dates for select to authenticated using (true);
create policy "admin fecha dias" on public.blocked_dates for insert to authenticated with check ((select private.is_admin()));
create policy "admin edita dias fechados" on public.blocked_dates for update to authenticated using ((select private.is_admin()));
create policy "admin reabre dias" on public.blocked_dates for delete to authenticated using ((select private.is_admin()));

create policy "todos veem a duração" on public.booking_settings for select to authenticated using (true);
create policy "admin muda a duração" on public.booking_settings for update to authenticated using ((select private.is_admin()));

-- Horários livres nos próximos p_days dias (máx. 90), em hora de Lisboa.
-- Exclui dias fechados, horas já passadas e horas que se sobrepõem a marcações.
create function public.available_slots(p_days integer default 30)
returns setof timestamptz
language sql stable security definer set search_path = '' as $$
  with s as (select slot_minutes from public.booking_settings limit 1),
  today as (select (now() at time zone 'Europe/Lisbon')::date as d),
  days as (
    select (today.d + n)::date as day
    from today, generate_series(0, least(greatest(p_days, 1), 90)) n
  ),
  slots as (
    select ((dd.day + a.start_time + make_interval(mins => s.slot_minutes * g)) at time zone 'Europe/Lisbon') as starts_at,
           s.slot_minutes
    from days dd
    join public.availability a on a.weekday = extract(isodow from dd.day)
    cross join s
    cross join lateral generate_series(
      0, floor(extract(epoch from (a.end_time - a.start_time)) / 60 / s.slot_minutes)::int - 1) g
    where not exists (select 1 from public.blocked_dates b where b.day = dd.day)
  )
  select distinct sl.starts_at from slots sl
  where sl.starts_at > now()
    and not exists (
      select 1 from public.appointments ap
      where ap.starts_at < sl.starts_at + make_interval(mins => sl.slot_minutes)
        and ap.starts_at + make_interval(mins => ap.duration_minutes) > sl.starts_at)
  order by 1;
$$;
revoke execute on function public.available_slots(integer) from public, anon;
grant execute on function public.available_slots(integer) to authenticated;

-- A preferência de horário da ficha tem de ser um horário livre.
create function private.check_preferred_slot() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.preferred_slot is not null
     and not exists (select 1 from public.available_slots(90) s where s = new.preferred_slot) then
    raise exception 'Esse horário já não está livre.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger check_preferred_slot before insert on public.anamnese_forms
  for each row execute function private.check_preferred_slot();
