# PilotX — Invitation Manager

Fondasi baru aplikasi undangan WhatsApp. Repository ini dibuat dari awal dan tidak menggunakan ulang kode aplikasi lama.

## Teknologi
- React 19 + TypeScript + Vite
- Supabase JS untuk autentikasi dan database (integrasi tahap berikutnya)
- Cloudflare Pages untuk hosting frontend (setelah repository siap)
- Google Drive direncanakan sebagai penyimpanan gambar undangan

## Menjalankan lokal
```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dengan URL Supabase dan anon/publishable key. Jangan pernah menaruh service-role key di frontend atau repository.

## Build
```bash
npm run build
```

Hasil build berada di folder `dist`, sesuai untuk Cloudflare Pages dengan build command `npm run build` dan output directory `dist`.

## Ruang lingkup awal
- Dashboard admin
- Data Acara: hanya Tanggal Acara dan Upload Gambar
- Data Tamu
- Bot WhatsApp
- Pengaturan

> Status: kerangka antarmuka awal. Autentikasi, penyimpanan database, upload Google Drive, dan koneksi provider WhatsApp belum diaktifkan.