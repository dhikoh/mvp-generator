export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-1">CMS & Pengaturan Sistem</h2>
        <p className="text-sm text-[var(--text-secondary)]">Kelola konten landing page, pengaturan harga, dan web app konfigurasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold border-b border-[var(--text-secondary)] pb-2">Pengaturan Harga (Tier)</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Harga Sewa Harian (Termurah)</label>
            <div className="flex items-center space-x-2">
              <span className="text-[var(--text-secondary)]">Rp</span>
              <input type="number" defaultValue={10000} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Per bulan, dikonversi untuk +3 hari masa aktif per pembayaran.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tier User Pro (Per Bulan)</label>
            <div className="flex items-center space-x-2">
              <span className="text-[var(--text-secondary)]">Rp</span>
              <input type="number" defaultValue={50000} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tier User Ultra (Per Bulan)</label>
            <div className="flex items-center space-x-2">
              <span className="text-[var(--text-secondary)]">Rp</span>
              <input type="number" defaultValue={150000} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
            </div>
          </div>
          
          <button className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl neu-flat font-semibold w-full mt-4">Simpan Harga</button>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold border-b border-[var(--text-secondary)] pb-2">Rekening Pembayaran</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nama Bank</label>
            <input type="text" defaultValue="BCA" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Rekening</label>
            <input type="text" defaultValue="1234567890" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Atas Nama</label>
            <input type="text" defaultValue="PT MVP Generator" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
          </div>
          <button className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl neu-flat font-semibold w-full mt-4">Simpan Rekening</button>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4 md:col-span-2">
          <h3 className="text-lg font-bold border-b border-[var(--text-secondary)] pb-2">Pengaturan Landing Page (CMS)</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Hero Title</label>
            <input type="text" defaultValue="Prompt Generator Terbaik untuk Kreator" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
            <textarea rows={2} defaultValue="Tingkatkan produktivitas pembuatan konten dengan AI Prompt JSON yang dirancang khusus." className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
          </div>
          <button className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl neu-flat font-semibold w-full md:w-auto mt-4">Simpan CMS</button>
        </div>
      </div>
    </div>
  );
}
