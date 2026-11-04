alter table public.personal_garansi
  add column if not exists pdf_file_id text,
  add column if not exists pdf_url text,
  add column if not exists pdf_generated_at timestamptz,
  add column if not exists pdf_status text not null default 'pending'
    check (pdf_status in ('pending','generated','failed')),
  add column if not exists pdf_error text;