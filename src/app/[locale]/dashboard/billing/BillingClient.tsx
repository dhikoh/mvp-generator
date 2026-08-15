"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingClient() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const packages = [
    { name: 'USER_STANDARD', label: 'USER STANDARD', desc: '1 Profile Channel', price: 10000 },
    { name: 'USER_PRO', label: 'USER PRO', desc: '3 Profile Channel', price: 50000, pop: true },
    { name: 'USER_ULTRA', label: 'USER ULTRA', desc: '10 Profile Channel', price: 150000 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Limit file size to 2MB to prevent Base64 bloat and API limit errors
      if (selectedFile.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal ukuran file adalah 2MB.");
        e.target.value = ""; // reset input
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async () => {
    if (!selectedTier) {
      alert("Pilih paket terlebih dahulu.");
      return;
    }
    if (!file) {
      alert("Unggah bukti transfer terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const base64Image = await toBase64(file);
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedTier.price,
          tier: selectedTier.name,
          proofUrl: base64Image
        })
      });

      if (res.ok) {
        alert("Top-Up berhasil diajukan! Menunggu verifikasi admin.");
        setSelectedTier(null);
        setFile(null);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengajukan Top-Up");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Pilihan Paket Langganan</h3>
      
      {packages.map((pkg) => (
        <div 
          key={pkg.name}
          onClick={() => setSelectedTier(pkg)}
          className={`neu-flat p-5 rounded-2xl flex justify-between items-center border transition cursor-pointer relative overflow-hidden ${
            selectedTier?.name === pkg.name ? 'border-[var(--accent)] shadow-[0_0_15px_var(--accent)]' : 'border-transparent hover:border-[var(--accent)]'
          }`}
        >
          {pkg.pop && <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">TERPOPULER</div>}
          <div>
            <h4 className="font-bold">{pkg.label}</h4>
            <p className="text-xs text-[var(--text-secondary)]">{pkg.desc}</p>
            <p className="text-sm font-semibold text-[var(--accent)] mt-2">Rp {pkg.price.toLocaleString('id-ID')} / Bulan</p>
          </div>
          <button 
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-lg transition ${
              selectedTier?.name === pkg.name ? 'bg-[var(--accent)] text-white' : 'bg-transparent border border-[var(--text-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            {selectedTier?.name === pkg.name ? 'Dipilih' : 'Pilih'}
          </button>
        </div>
      ))}

      {selectedTier && (
        <div className="glass-panel p-5 rounded-2xl mt-4 border border-[var(--accent)]/50">
          <h4 className="font-bold text-sm mb-2">Konfirmasi Pembayaran ({selectedTier.label})</h4>
          <p className="text-xs text-[var(--text-secondary)] mb-2">Silakan transfer <b>Rp {selectedTier.price.toLocaleString('id-ID')}</b> ke BCA 1234567890 a.n PT MVP.</p>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Setelah transfer, unggah bukti di sini (Maks 2MB, JPG/PNG).</p>
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/jpg"
            onChange={handleFileChange}
            className="text-xs mb-3 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent)] file:text-white hover:file:bg-[var(--accent)]/90" 
          />
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !file}
            className="w-full py-2 bg-[var(--accent)] text-white font-bold rounded-xl neu-flat text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Transfer'}
          </button>
        </div>
      )}
    </div>
  );
}

