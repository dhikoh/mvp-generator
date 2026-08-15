"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserManagementClient({ users }: { users: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // State for forms
  const [newRole, setNewRole] = useState('');
  const [addDays, setAddDays] = useState<number | ''>('');
  const [newPassword, setNewPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdate = async (action: 'UPDATE_ROLE' | 'ADD_DAYS' | 'RESET_PASSWORD') => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    let payload: any = { userId: selectedUser.id, action };

    if (action === 'UPDATE_ROLE') {
      if (!newRole) { alert("Pilih role baru"); setIsProcessing(false); return; }
      payload.role = newRole;
    } else if (action === 'ADD_DAYS') {
      if (!addDays || addDays <= 0) { alert("Masukkan jumlah hari yang valid"); setIsProcessing(false); return; }
      payload.days = addDays;
    } else if (action === 'RESET_PASSWORD') {
      if (!newPassword || newPassword.length < 6) { alert("Password minimal 6 karakter"); setIsProcessing(false); return; }
      payload.newPassword = newPassword;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Berhasil memperbarui data user!");
        setNewRole('');
        setAddDays('');
        setNewPassword('');
        setSelectedUser(null);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(false);
    }
  };

  const openModal = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setAddDays('');
    setNewPassword('');
  };

  return (
    <div>
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Cari user berdasarkan nama, email, username..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-3 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--text-secondary)] text-sm">
              <th className="pb-3 px-2">Info User</th>
              <th className="pb-3 px-2">Role/Tier</th>
              <th className="pb-3 px-2">Channels</th>
              <th className="pb-3 px-2">Masa Aktif</th>
              <th className="pb-3 px-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-200/20 last:border-0 hover:bg-black/5 transition">
                <td className="py-3 px-2">
                  <div className="text-sm font-bold">{user.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{user.email} | @{user.username}</div>
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.role === 'SUPERADMIN' ? 'bg-red-500/20 text-red-600' :
                    user.role === 'USER_ULTRA' ? 'bg-purple-500/20 text-purple-600' :
                    user.role === 'USER_PRO' ? 'bg-blue-500/20 text-blue-600' :
                    user.role === 'USER_STANDARD' ? 'bg-green-500/20 text-green-600' :
                    'bg-yellow-500/20 text-yellow-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm">{user._count.channels} Channel</td>
                <td className="py-3 px-2 text-sm">
                  {user.billingActiveUntil ? new Date(user.billingActiveUntil).toLocaleDateString('id-ID') : '-'}
                </td>
                <td className="py-3 px-2 text-right">
                  <button 
                    onClick={() => openModal(user)}
                    className="px-3 py-1 bg-[var(--text-secondary)] text-white text-xs rounded neu-flat hover:opacity-90"
                  >
                    Kelola
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-[var(--text-secondary)]">
                  Tidak ada user ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold mb-4">Kelola User: {selectedUser.name}</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-medium mb-1">Ganti Role / Tier</label>
                <div className="flex space-x-2">
                  <select 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="flex-1 p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent"
                  >
                    <option value="USER_DEMO">USER DEMO (Unverified)</option>
                    <option value="USER_STANDARD">USER STANDARD (1 Channel)</option>
                    <option value="USER_PRO">USER PRO (3 Channels)</option>
                    <option value="USER_ULTRA">USER ULTRA (10 Channels)</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  </select>
                  <button disabled={isProcessing || newRole === selectedUser.role} onClick={() => handleUpdate('UPDATE_ROLE')} className="px-3 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-xl disabled:opacity-50">Ubah</button>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">Catatan: Menurunkan tier akan mengunci channel berlebih secara otomatis via channelLockLogic.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium mb-1">Tambah Masa Aktif (Hari)</label>
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    value={addDays}
                    onChange={(e) => setAddDays(parseInt(e.target.value) || '')}
                    placeholder="Contoh: 30" 
                    className="flex-1 p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" 
                  />
                  <button disabled={isProcessing || !addDays} onClick={() => handleUpdate('ADD_DAYS')} className="px-3 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-xl disabled:opacity-50">Tambah</button>
                </div>
              </div>

              <hr className="border-[var(--text-secondary)] opacity-20" />

              <div className="space-y-2">
                <label className="block text-xs font-medium mb-1 text-red-500">Force Reset Password</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru" 
                    className="flex-1 p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" 
                  />
                  <button disabled={isProcessing || !newPassword} onClick={() => handleUpdate('RESET_PASSWORD')} className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-xl disabled:opacity-50">Reset</button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl neu-flat text-[var(--text-secondary)] font-semibold text-sm w-full"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
