"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChannelManagerClient({ initialChannels: channels }: { initialChannels: any[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    channelName: '',
    niche: '',
    description: '',
    visualAesthetic: 'realistis'
  });

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.channelName) {
      alert("Nama channel wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert("Channel berhasil ditambahkan!");
        setShowModal(false);
        setForm({ channelName: '', niche: '', description: '', visualAesthetic: 'realistis' });
        router.refresh(); // This will fetch fresh initialChannels from server
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambahkan channel");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="glass-panel p-6 rounded-3xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Kelola Profile Channel</h2>
          <p className="text-sm text-[var(--text-secondary)]">Atur niche, gaya visual, dan katalog produk promosi Anda.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl shadow-lg neu-flat hover:opacity-90 transition"
        >
          + Tambah Channel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <div key={channel.id} className="neu-flat p-5 rounded-2xl relative">
            {channel.isLocked && (
              <div className="absolute top-4 right-4 bg-red-500/10 text-red-500 p-1 px-2 rounded text-xs font-bold flex items-center space-x-1">
                <span>🔒 Terkunci</span>
              </div>
            )}
            <h3 className="text-lg font-bold truncate pr-16">{channel.channelName}</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 h-10 line-clamp-2">{channel.description}</p>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Niche</span>
                <span className="font-semibold">{channel.niche || 'Belum diatur'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Visual</span>
                <span className="font-semibold capitalize">{channel.visualAesthetic || 'Realistis'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Terakhir Digunakan</span>
                <span className="font-semibold">{new Date(channel.lastUsedAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              <button disabled={channel.isLocked} className="flex-1 py-2 bg-transparent border border-[var(--accent)] text-[var(--accent)] text-sm rounded-xl font-medium hover:bg-[var(--accent)] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                Edit
              </button>
              <button disabled={channel.isLocked} className="flex-1 py-2 bg-transparent border border-[var(--text-secondary)] text-[var(--text-secondary)] text-sm rounded-xl font-medium hover:bg-[var(--text-secondary)] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                Katalog Produk
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold mb-4">Tambah Channel Baru</h3>
            <form onSubmit={handleAddChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Nama Channel *</label>
                <input 
                  type="text" 
                  required
                  value={form.channelName}
                  onChange={e => setForm({...form, channelName: e.target.value})}
                  className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Niche / Topik</label>
                <input 
                  type="text" 
                  value={form.niche}
                  onChange={e => setForm({...form, niche: e.target.value})}
                  className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Deskripsi Singkat</label>
                <textarea 
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Estetika Visual (Opsional)</label>
                <select 
                  value={form.visualAesthetic}
                  onChange={e => setForm({...form, visualAesthetic: e.target.value})}
                  className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent"
                >
                  <option value="realistis">Realistis</option>
                  <option value="kartun">Kartun / Animasi</option>
                  <option value="minimalis">Minimalis</option>
                  <option value="gelap">Dark Mode / Cinematic</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl neu-flat text-[var(--text-secondary)] font-semibold text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl neu-flat bg-[var(--accent)] text-white font-semibold text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
