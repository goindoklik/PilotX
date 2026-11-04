alter table public.events
  add column if not exists attendance_saved_guest_count integer not null default 0;
