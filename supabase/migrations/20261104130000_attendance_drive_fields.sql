alter table public.events
  add column if not exists attendance_drive_folder_id text,
  add column if not exists attendance_drive_file_ids jsonb not null default '[]'::jsonb;
