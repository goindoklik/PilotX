alter table public.personal_garansi
  add column if not exists source_letter_id uuid;

create unique index if not exists personal_garansi_source_letter_id_uidx
  on public.personal_garansi (source_letter_id)
  where source_letter_id is not null;