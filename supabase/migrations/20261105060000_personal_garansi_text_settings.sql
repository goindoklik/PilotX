create table if not exists public.pilotx_settings (
  setting_key text primary key,
  setting_value text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.pilotx_settings enable row level security;

drop policy if exists pilotx_settings_admin_select on public.pilotx_settings;
drop policy if exists "PilotX admin can read settings" on public.pilotx_settings;
create policy "PilotX admin can read settings"
on public.pilotx_settings for select to authenticated
using ((select lower(auth.jwt()->>'email')) = 'admin@pilotx.com');

drop policy if exists pilotx_settings_admin_insert on public.pilotx_settings;
drop policy if exists "PilotX admin can insert settings" on public.pilotx_settings;
create policy "PilotX admin can insert settings"
on public.pilotx_settings for insert to authenticated
with check ((select lower(auth.jwt()->>'email')) = 'admin@pilotx.com');

drop policy if exists pilotx_settings_admin_update on public.pilotx_settings;
drop policy if exists "PilotX admin can update settings" on public.pilotx_settings;
create policy "PilotX admin can update settings"
on public.pilotx_settings for update to authenticated
using ((select lower(auth.jwt()->>'email')) = 'admin@pilotx.com')
with check ((select lower(auth.jwt()->>'email')) = 'admin@pilotx.com');

grant select, insert, update on public.pilotx_settings to authenticated;

insert into public.pilotx_settings(setting_key, setting_value)
values (
  'personal_garansi_text',
  E'PERJANJIAN PERSONAL GARANSI\n\nPada tanggal {{tanggal}}, yang bertanda tangan di bawah ini:\n\nNama Penjamin: {{penjamin}}\nPekerjaan: {{pekerjaan}}\nNomor KTP: {{no_ktp}}\n\nDengan ini memberikan jaminan kepada Investor: {{investor}}\nDengan nilai jaminan sebesar: {{nominal}} ({{terbilang}} rupiah).\n\nSaksi-saksi:\n1. {{saksi_1}}\n2. {{saksi_2}}\n\nDibuat di {{dibuat_di}}, pada tanggal {{tanggal}}.\n\nPenjamin,\n\n\n{{penjamin}}'
)
on conflict (setting_key) do nothing;
