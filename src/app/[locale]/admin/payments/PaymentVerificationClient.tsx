"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentVerificationClient({ pending, history }: { pending: any[], history: any[] }) {
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleAction = async (paymentId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Yakin ingin ${status === 'APPROVED' ? 'menerima' : 'menolak'} pembayaran ini?`)) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status })
      });

      if (res.ok) {
        alert(`Pembayaran berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memproses pembayaran");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setTab('pending')}
          className={`pb-2 px-4 font-semibold ${tab === 'pending' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
        >
          Menunggu ({pending.length})
        </button>
        <button 
          onClick={() => setTab('history')}
          className={`pb-2 px-4 font-semibold ${tab === 'history' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
        >
          Riwayat
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--text-secondary)] text-sm">
              <th className="pb-3 px-2">Tanggal</th>
              <th className="pb-3 px-2">User</th>
              <th className="pb-3 px-2">Tier Dibeli</th>
              <th className="pb-3 px-2">Nominal</th>
              <th className="pb-3 px-2">Bukti Transfer</th>
              <th className="pb-3 px-2 text-right">Aksi / Status</th>
            </tr>
          </thead>
          <tbody>
            {(tab === 'pending' ? pending : history).map(item => (
              <tr key={item.id} className="border-b border-gray-200/20 last:border-0 hover:bg-black/5 transition">
                <td className="py-3 px-2 text-sm text-[var(--text-secondary)]">
                  {new Date(item.createdAt).toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-2">
                  <div className="text-sm font-bold">{item.user.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">@{item.user.username}</div>
                </td>
                <td className="py-3 px-2">
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-600 text-xs font-bold">
                    {item.tier}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm font-semibold text-green-500">
                  Rp {item.amount.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-2 text-sm">
                  <a href={`/api/admin/payments/${item.id}/proof`} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline block max-w-[100px] truncate">
                    Lihat Bukti
                  </a>
                </td>
                <td className="py-3 px-2 text-right">
                  {tab === 'pending' ? (
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleAction(item.id, 'APPROVED')} 
                        disabled={isProcessing}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded neu-flat hover:opacity-90 disabled:opacity-50"
                      >
                        Terima
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, 'REJECTED')}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded neu-flat hover:opacity-90 disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'APPROVED' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                      {item.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {(tab === 'pending' ? pending : history).length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-sm text-[var(--text-secondary)]">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

