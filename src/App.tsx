import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  Activity, CalendarDays, Camera, CheckCircle2, CircleHelp, ClipboardList,
  CloudUpload, Image as ImageIcon, LayoutDashboard, LockKeyhole, LogOut,
  MessageCircle, MoreHorizontal, Settings, ShieldCheck, Users, X
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from './lib/supabase'

type Page = 'dashboard' | 'events' | 'guests' | 'bot' | 'settings'
type EventRow = {
  id: string
  event_date: string
  image_url: string
  public_slug: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
}
type GuestRow = {
  id: string
  event_id: string
  guest_name: string
  phone: string
  attendance_status: 'invited' | 'attending' | 'not_attending'
  created_at: string
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'events', label: 'Data Acara', icon: CalendarDays },
  { id: 'guests', label: 'Data Tamu', icon: Users },
  { id: 'bot', label: 'Bot WhatsApp', icon: MessageCircle },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
]

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [events, setEvents] = useState<EventRow[]>([])
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [eventDate, setEventDate] = useState('')
  const [imageName, setImageName] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return
      if (error) setAuthError(error.message)
      const current = data.session
      if (current && current.user.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut()
        if (active) setAuthError('Akun ini belum memiliki akses admin PilotX.')
      } else if (active) {
        setSession(current)
      }
      if (active) setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      if (nextSession && nextSession.user.app_metadata?.role !== 'admin') {
        setSession(null)
        void supabase.auth.signOut()
        setAuthError('Akun ini belum memiliki akses admin PilotX.')
        return
      }
      setSession(nextSession)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !session) {
      setEvents([])
      setGuests([])
      return
    }
    let active = true
    setDataLoading(true)
    Promise.all([
      supabase.from('events').select('id,event_date,image_url,public_slug,status,created_at').order('created_at', { ascending: false }),
      supabase.from('guests').select('id,event_id,guest_name,phone,attendance_status,created_at').order('created_at', { ascending: false }),
    ]).then(([eventResult, guestResult]) => {
      if (!active) return
      if (eventResult.error) setNotice('Gagal memuat acara: ' + eventResult.error.message)
      else setEvents((eventResult.data ?? []) as EventRow[])
      if (guestResult.error) setNotice('Gagal memuat tamu: ' + guestResult.error.message)
      else setGuests((guestResult.data ?? []) as GuestRow[])
      setDataLoading(false)
    })
    return () => { active = false }
  }, [session])

  async function signIn(email: string, password: string) {
    if (!supabase) return
    setAuthError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(error.message)
      return
    }
    if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      setAuthError('Login berhasil, tetapi akun belum memiliki role admin PilotX.')
    }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setPage('dashboard')
  }

  function chooseImage(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setNotice('File harus berupa gambar.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setNotice('Ukuran gambar maksimal 10 MB.')
      return
    }
    setImageName(file.name)
    setImagePreview(URL.createObjectURL(file))
    setNotice('Gambar siap ditinjau. Integrasi Google Drive perlu diselesaikan sebelum acara dapat disimpan.')
  }

  if (!isSupabaseConfigured) {
    return <SetupScreen />
  }
  if (authLoading) {
    return <div className="auth-screen"><div className="auth-card"><div className="brand-mark">P</div><strong>Memeriksa sesi admin…</strong></div></div>
  }
  if (!session) {
    return <LoginScreen onLogin={signIn} error={authError} />
  }

  const pageTitle = navItems.find((item) => item.id === page)?.label ?? 'Dashboard'
  const attendingCount = guests.filter((guest) => guest.attendance_status === 'attending').length

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">P</div><div><strong>PilotX</strong><span>INVITATION MANAGER</span></div></div>
        <div className="workspace-label">MENU UTAMA</div>
        <nav className="side-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === 'bot' && <i className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={18} /></div><strong>Butuh bantuan?</strong><p>Pusat bantuan pengelolaan undangan.</p><button onClick={() => setNotice('Panduan penggunaan akan tersedia setelah sistem selesai dikonfigurasi.')}>Lihat panduan <span>→</span></button></div>
          <div className="profile-mini"><div className="avatar">PX</div><div className="profile-text"><strong>{session.user.email}</strong><span>Administrator</span></div><button className="icon-button" aria-label="Keluar" onClick={signOut}><LogOut size={17} /></button></div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">PilotX <span>/</span> {pageTitle}</div><div className="top-actions"><div className="system-status"><span /> Terhubung ke database</div><button className="icon-button" aria-label="Bantuan" onClick={() => setNotice('Panel bantuan belum dikonfigurasi.')}><CircleHelp size={19} /></button><div className="top-avatar">PX</div></div></header>
        <div className="content">
          <div className="page-heading"><div><div className="eyebrow">PANEL ADMINISTRASI</div><h1>{pageTitle}</h1><p>Kelola undangan dan tamu acara PilotX dari satu tempat.</p></div><div className="heading-date"><CalendarDays size={16} /> {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())}</div></div>
          {notice && <div className="notice"><CheckCircle2 size={17} /><span>{notice}</span><button aria-label="Tutup" onClick={() => setNotice('')}><X size={16} /></button></div>}
          {dataLoading && <div className="loading-line">Memuat data dari Supabase…</div>}
          {page === 'dashboard' && <Dashboard onOpen={setPage} eventCount={events.length} guestCount={guests.length} attendingCount={attendingCount} />}
          {page === 'events' && <section className="panel event-panel">
            <div className="panel-heading"><div><h2>Tambah Data Acara</h2><p>Isi tanggal acara dan unggah gambar undangan yang sudah final.</p></div><span className="step-tag">FORMULIR ACARA</span></div>
            <div className="form-grid">
              <label className="field-label">Tanggal Acara<input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></label>
              <div className="field-label">Upload Gambar Undangan<label className="upload-box">{imagePreview ? <img src={imagePreview} alt="Pratinjau gambar undangan" /> : <div className="upload-placeholder"><div className="upload-icon"><CloudUpload size={23} /></div><strong>Klik untuk memilih gambar</strong><span>PNG, JPG atau WEBP · Maksimal 10 MB</span></div>}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => chooseImage(e.target.files?.[0])} /></label>{imageName && <div className="file-selected"><ImageIcon size={15} />{imageName}<button onClick={() => { setImageName(''); setImagePreview('') }} aria-label="Hapus gambar"><X size={15} /></button></div>}</div>
            </div>
            <div className="form-footer"><span>Gambar yang sama akan digunakan pada halaman undangan dan pesan WhatsApp.</span><button className="primary-button" disabled={!eventDate || !imageName} onClick={() => setNotice('Penyimpanan acara menunggu integrasi upload Google Drive agar gambar final tersimpan sesuai rencana.')}><CheckCircle2 size={16} /> Simpan Acara</button></div>
            <div className="data-list-heading"><h2>Daftar Acara</h2><span>{events.length} acara</span></div>
            {events.length === 0 ? <div className="empty-inline">Belum ada data acara.</div> : <div className="table-wrap"><table><thead><tr><th>Tanggal</th><th>Gambar</th><th>Status</th><th>Link Undangan</th></tr></thead><tbody>{events.map((event) => <tr key={event.id}><td>{new Date(event.event_date + 'T00:00:00').toLocaleDateString('id-ID', { dateStyle: 'long' })}</td><td><a href={event.image_url} target="_blank" rel="noreferrer">Lihat gambar</a></td><td>{event.status}</td><td><a href={`/acara/${event.public_slug}`} target="_blank" rel="noreferrer">Buka undangan</a></td></tr>)}</tbody></table></div>}
          </section>}
          {page === 'guests' && <section className="panel"><div className="panel-heading"><div><h2>Data Tamu</h2><p>Daftar tamu dan konfirmasi kehadiran.</p></div><span className="step-tag">{guests.length} TAMU</span></div>{guests.length === 0 ? <div className="empty-panel"><div className="empty-icon"><Users size={25} /></div><h2>Belum ada data tamu</h2><p>Data tamu akan muncul setelah daftar tamu dimasukkan atau balasan WhatsApp diterima.</p></div> : <div className="table-wrap"><table><thead><tr><th>Nama</th><th>Nomor WhatsApp</th><th>Status Kehadiran</th></tr></thead><tbody>{guests.map((guest) => <tr key={guest.id}><td>{guest.guest_name}</td><td>{guest.phone}</td><td>{guest.attendance_status === 'attending' ? 'Hadir' : guest.attendance_status === 'not_attending' ? 'Tidak hadir' : 'Diundang'}</td></tr>)}</tbody></table></div>}</section>}
          {page === 'bot' && <section className="panel"><div className="panel-heading"><div><h2>Bot WhatsApp</h2><p>Pengaturan koneksi dan aktivitas pesan undangan.</p></div><span className="status-off">Belum terhubung</span></div><div className="bot-placeholder"><div className="bot-symbol"><MessageCircle size={28} /></div><div><strong>Koneksi WhatsApp belum diatur</strong><p>Provider WhatsApp, webhook, dan proses balasan tamu akan dikonfigurasi setelah fondasi database selesai.</p></div></div><div className="bot-checks"><div><span className="check-muted">1</span> Provider WhatsApp <b>Belum diatur</b></div><div><span className="check-muted">2</span> Webhook pesan masuk <b>Belum diatur</b></div><div><span className="check-muted">3</span> Template balasan <b>Belum diatur</b></div></div></section>}
          {page === 'settings' && <section className="panel"><div className="panel-heading"><div><h2>Pengaturan Sistem</h2><p>Konfigurasi dasar aplikasi PilotX.</p></div></div><div className="setting-row"><div><strong>Status Supabase</strong><span>Koneksi database aplikasi</span></div><span className="status-on">Terhubung</span></div><div className="setting-row"><div><strong>Penyimpanan gambar</strong><span>Google Drive untuk file undangan</span></div><span className="status-off">Belum dikonfigurasi</span></div><div className="setting-row"><div><strong>Provider WhatsApp</strong><span>Pengiriman dan penerimaan pesan</span></div><span className="status-off">Belum dikonfigurasi</span></div></section>}
          <footer className="footer"><span>© {new Date().getFullYear()} PilotX Invitation Manager</span><span>Database aktif · Admin aman</span></footer>
        </div>
      </main>
    </div>
  )
}

function LoginScreen({ onLogin, error }: { onLogin: (email: string, password: string) => Promise<void>; error: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    await onLogin(email, password)
    setLoading(false)
  }
  return <div className="auth-screen"><form className="auth-card" onSubmit={submit}><div className="brand-mark auth-mark">P</div><div className="eyebrow">PILOTX INVITATION MANAGER</div><h1>Login Admin</h1><p>Masuk untuk mengelola acara dan data tamu.</p><label>Email Admin<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>{error && <div className="auth-error">{error}</div>}<button className="primary-button" type="submit" disabled={loading}>{loading ? 'Memeriksa…' : <><LockKeyhole size={16} /> Masuk ke Dashboard</>}</button><span className="auth-footnote">Akses hanya untuk akun admin yang telah diotorisasi.</span></form></div>
}

function SetupScreen() {
  return <div className="auth-screen"><div className="auth-card"><div className="brand-mark auth-mark">P</div><div className="eyebrow">PILOTX INVITATION MANAGER</div><h1>Konfigurasi Supabase</h1><p>Dashboard belum menerima environment variables Supabase.</p><div className="auth-error">Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Cloudflare Pages, lalu lakukan redeploy.</div></div></div>
}

function Dashboard({ onOpen, eventCount, guestCount, attendingCount }: { onOpen: (page: Page) => void; eventCount: number; guestCount: number; attendingCount: number }) {
  return <>
    <div className="stats-grid">
      <StatCard label="Total Acara" value={eventCount} note="Data acara tersimpan" icon={<CalendarDays size={18} />} tone="blue" />
      <StatCard label="Total Tamu" value={guestCount} note="Daftar tamu terdaftar" icon={<Users size={18} />} tone="violet" />
      <StatCard label="Undangan Terkirim" value="—" note="Menunggu integrasi WhatsApp" icon={<MessageCircle size={18} />} tone="green" />
      <StatCard label="Konfirmasi Hadir" value={attendingCount} note="Tamu yang menyatakan hadir" icon={<CheckCircle2 size={18} />} tone="amber" />
    </div>
    <div className="dashboard-grid">
      <section className="panel quick-panel"><div className="panel-heading"><div><h2>Akses Cepat</h2><p>Mulai kelola kebutuhan acara Anda.</p></div></div><div className="quick-actions"><button onClick={() => onOpen('events')}><span className="quick-icon blue"><CalendarDays size={20} /></span><span><strong>Tambah Acara</strong><small>Atur tanggal dan gambar undangan</small></span><b>→</b></button><button onClick={() => onOpen('guests')}><span className="quick-icon violet"><Users size={20} /></span><span><strong>Lihat Data Tamu</strong><small>Kelola daftar penerima undangan</small></span><b>→</b></button><button onClick={() => onOpen('bot')}><span className="quick-icon green"><MessageCircle size={20} /></span><span><strong>Pengaturan Bot</strong><small>Siapkan koneksi WhatsApp</small></span><b>→</b></button></div></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Aktivitas Terbaru</h2><p>Ringkasan aktivitas sistem.</p></div><Activity size={19} color="#8792a8" /></div><div className="activity-empty"><div className="activity-empty-icon"><ClipboardList size={22} /></div><strong>Belum ada aktivitas</strong><span>Aktivitas akan muncul setelah sistem mulai digunakan.</span></div></section>
    </div>
    <section className="panel getting-started"><div className="getting-icon"><Camera size={22} /></div><div><strong>Mulai dari data acara</strong><p>Siapkan tanggal dan unggah gambar undangan final. Gambar yang sama akan dipakai di halaman undangan dan WhatsApp.</p></div><button onClick={() => onOpen('events')}>Buat acara <span>→</span></button></section>
  </>
}

function StatCard({ label, value, note, icon, tone }: { label: string; value: string | number; note: string; icon: ReactNode; tone: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}>{icon}</div></div><strong>{value}</strong><small>{note}</small></div>
}

export default App
