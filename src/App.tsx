import { useMemo, useState } from 'react'
import {
  Activity, CalendarDays, Camera, CheckCircle2, ChevronDown, CircleHelp,
  ClipboardList, CloudUpload, Image as ImageIcon, LayoutDashboard, LogOut,
  MessageCircle, MoreHorizontal, Search, Settings, ShieldCheck, Users, X
} from 'lucide-react'
import { isSupabaseConfigured } from './lib/supabase'

type Page = 'dashboard' | 'events' | 'guests' | 'bot' | 'settings'

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'events', label: 'Data Acara', icon: CalendarDays },
  { id: 'guests', label: 'Data Tamu', icon: Users },
  { id: 'bot', label: 'Bot WhatsApp', icon: MessageCircle },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
]

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [previewMode, setPreviewMode] = useState(false)
  const [eventDate, setEventDate] = useState('')
  const [imageName, setImageName] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  const pageTitle = useMemo(() => navItems.find((item) => item.id === page)?.label ?? 'Dashboard', [page])

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
    setNotice('Gambar siap ditinjau. Penyimpanan ke Google Drive akan diaktifkan setelah integrasi backend.')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div><strong>PilotX</strong><span>INVITATION MANAGER</span></div>
        </div>
        <div className="workspace-label">MENU UTAMA</div>
        <nav className="side-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {id === 'bot' && <i className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={18} /></div>
            <strong>Butuh bantuan?</strong>
            <p>Pusat bantuan pengelolaan undangan.</p>
            <button onClick={() => setNotice('Panduan penggunaan akan tersedia setelah sistem selesai dikonfigurasi.')}>Lihat panduan <span>→</span></button>
          </div>
          <div className="profile-mini">
            <div className="avatar">PX</div>
            <div className="profile-text"><strong>Administrator</strong><span>Admin Panel</span></div>
            <MoreHorizontal size={19} color="#8792a8" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">PilotX <span>/</span> {pageTitle}</div>
          <div className="top-actions">
            <div className="system-status"><span /> Sistem baru</div>
            <button className="icon-button" aria-label="Bantuan" onClick={() => setNotice('Panel bantuan belum dikonfigurasi.')}><CircleHelp size={19} /></button>
            <div className="top-avatar">PX</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><div className="eyebrow">PANEL ADMINISTRASI</div><h1>{pageTitle}</h1><p>Kelola undangan dan tamu acara PilotX dari satu tempat.</p></div>
            <div className="heading-date"><CalendarDays size={16} /> {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())}</div>
          </div>

          {!isSupabaseConfigured && <div className="setup-banner"><ShieldCheck size={19} /><div><strong>Mode persiapan</strong><span>Database belum dihubungkan. Tampilan ini adalah kerangka awal; data belum disimpan.</span></div><span className="setup-pill">BELUM TERHUBUNG</span></div>}
          {notice && <div className="notice"><CheckCircle2 size={17} /><span>{notice}</span><button aria-label="Tutup" onClick={() => setNotice('')}><X size={16} /></button></div>}

          {page === 'dashboard' && <Dashboard onOpen={setPage} />}
          {page === 'events' && (
            <section className="panel event-panel">
              <div className="panel-heading"><div><h2>Tambah Data Acara</h2><p>Isi tanggal acara dan unggah gambar undangan yang sudah final.</p></div><span className="step-tag">FORMULIR ACARA</span></div>
              <div className="form-grid">
                <label className="field-label">Tanggal Acara<input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></label>
                <div className="field-label">Upload Gambar Undangan
                  <label className="upload-box">
                    {imagePreview ? <img src={imagePreview} alt="Pratinjau gambar undangan" /> : <div className="upload-placeholder"><div className="upload-icon"><CloudUpload size={23} /></div><strong>Klik untuk memilih gambar</strong><span>PNG, JPG atau WEBP · Maksimal 10 MB</span></div>}
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => chooseImage(e.target.files?.[0])} />
                  </label>
                  {imageName && <div className="file-selected"><ImageIcon size={15} />{imageName}<button onClick={() => { setImageName(''); setImagePreview('') }} aria-label="Hapus gambar"><X size={15} /></button></div>}
                </div>
              </div>
              <div className="form-footer"><span>Gambar yang sama akan digunakan pada halaman undangan dan pesan WhatsApp.</span><button className="primary-button" disabled={!eventDate || !imageName} onClick={() => setNotice('Formulir sudah siap. Simpan ke database dan Google Drive akan aktif setelah integrasi Supabase selesai.')}><CheckCircle2 size={16} /> Simpan Acara</button></div>
            </section>
          )}
          {page === 'guests' && <section className="panel empty-panel"><div className="empty-icon"><Users size={25} /></div><h2>Data Tamu</h2><p>Daftar tamu, status undangan, dan konfirmasi kehadiran akan ditampilkan di sini setelah database dihubungkan.</p><div className="empty-state-tag">MENUNGGU INTEGRASI DATABASE</div></section>}
          {page === 'bot' && <section className="panel"><div className="panel-heading"><div><h2>Bot WhatsApp</h2><p>Pengaturan koneksi dan aktivitas pesan undangan.</p></div><span className="status-off">Belum terhubung</span></div><div className="bot-placeholder"><div className="bot-symbol"><MessageCircle size={28} /></div><div><strong>Koneksi WhatsApp belum diatur</strong><p>Provider WhatsApp, webhook, dan proses balasan tamu akan dikonfigurasi setelah fondasi database selesai.</p></div></div><div className="bot-checks"><div><span className="check-muted">1</span> Provider WhatsApp <b>Belum diatur</b></div><div><span className="check-muted">2</span> Webhook pesan masuk <b>Belum diatur</b></div><div><span className="check-muted">3</span> Template balasan <b>Belum diatur</b></div></div></section>}
          {page === 'settings' && <section className="panel"><div className="panel-heading"><div><h2>Pengaturan Sistem</h2><p>Konfigurasi dasar aplikasi PilotX.</p></div></div><div className="setting-row"><div><strong>Status Supabase</strong><span>Koneksi database aplikasi</span></div><span className={isSupabaseConfigured ? 'status-on' : 'status-off'}>{isSupabaseConfigured ? 'Konfigurasi tersedia' : 'Belum dikonfigurasi'}</span></div><div className="setting-row"><div><strong>Penyimpanan gambar</strong><span>Google Drive untuk file undangan</span></div><span className="status-off">Belum dikonfigurasi</span></div><div className="setting-row"><div><strong>Provider WhatsApp</strong><span>Pengiriman dan penerimaan pesan</span></div><span className="status-off">Belum dikonfigurasi</span></div></section>}
          <footer className="footer"><span>© {new Date().getFullYear()} PilotX Invitation Manager</span><span>Versi awal · Fondasi aplikasi</span></footer>
        </div>
      </main>
    </div>
  )
}

function Dashboard({ onOpen }: { onOpen: (page: Page) => void }) {
  return <>
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-top"><span>Total Acara</span><div className="stat-icon blue"><CalendarDays size={18} /></div></div><strong>—</strong><small>Belum ada data acara</small></div>
      <div className="stat-card"><div className="stat-top"><span>Total Tamu</span><div className="stat-icon violet"><Users size={18} /></div></div><strong>—</strong><small>Menunggu data tamu</small></div>
      <div className="stat-card"><div className="stat-top"><span>Undangan Terkirim</span><div className="stat-icon green"><MessageCircle size={18} /></div></div><strong>—</strong><small>Belum ada aktivitas bot</small></div>
      <div className="stat-card"><div className="stat-top"><span>Konfirmasi Hadir</span><div className="stat-icon amber"><CheckCircle2 size={18} /></div></div><strong>—</strong><small>Belum ada konfirmasi</small></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel quick-panel"><div className="panel-heading"><div><h2>Akses Cepat</h2><p>Mulai kelola kebutuhan acara Anda.</p></div></div><div className="quick-actions"><button onClick={() => onOpen('events')}><span className="quick-icon blue"><CalendarDays size={20} /></span><span><strong>Tambah Acara</strong><small>Atur tanggal dan gambar undangan</small></span><b>→</b></button><button onClick={() => onOpen('guests')}><span className="quick-icon violet"><Users size={20} /></span><span><strong>Lihat Data Tamu</strong><small>Kelola daftar penerima undangan</small></span><b>→</b></button><button onClick={() => onOpen('bot')}><span className="quick-icon green"><MessageCircle size={20} /></span><span><strong>Pengaturan Bot</strong><small>Siapkan koneksi WhatsApp</small></span><b>→</b></button></div></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Aktivitas Terbaru</h2><p>Ringkasan aktivitas sistem.</p></div><Activity size={19} color="#8792a8" /></div><div className="activity-empty"><div className="activity-empty-icon"><ClipboardList size={22} /></div><strong>Belum ada aktivitas</strong><span>Aktivitas akan muncul setelah sistem mulai digunakan.</span></div></section>
    </div>
    <section className="panel getting-started"><div className="getting-icon"><Camera size={22} /></div><div><strong>Mulai dari data acara</strong><p>Siapkan tanggal dan unggah gambar undangan final. Gambar yang sama akan dipakai di halaman undangan dan WhatsApp.</p></div><button onClick={() => onOpen('events')}>Buat acara <span>→</span></button></section>
  </>
}

export default App