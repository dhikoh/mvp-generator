

import prisma from "@/lib/prisma";

export default async function AdminOverview() {
  // Fetch summary data
  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({
    where: {
      billingActiveUntil: {
        gte: new Date()
      }
    }
  });

  const totalPayments = await prisma.billingHistory.aggregate({
    _sum: { amount: true },
    where: { status: 'APPROVED' }
  });

  const recentRegistrations = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, role: true, createdAt: true }
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-1">Dashboard Overview</h2>
        <p className="text-sm text-[var(--text-secondary)]">Ringkasan aktivitas platform MVP Generator.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neu-flat p-6 rounded-2xl flex flex-col items-center text-center">
          <span className="text-4xl mb-2">👥</span>
          <h3 className="text-lg font-semibold text-[var(--text-secondary)]">Total User</h3>
          <p className="text-3xl font-bold text-[var(--accent)] mt-2">{totalUsers}</p>
        </div>
        
        <div className="neu-flat p-6 rounded-2xl flex flex-col items-center text-center">
          <span className="text-4xl mb-2">🔥</span>
          <h3 className="text-lg font-semibold text-[var(--text-secondary)]">User Aktif</h3>
          <p className="text-3xl font-bold text-[var(--accent)] mt-2">{activeUsers}</p>
        </div>
        
        <div className="neu-flat p-6 rounded-2xl flex flex-col items-center text-center">
          <span className="text-4xl mb-2">💰</span>
          <h3 className="text-lg font-semibold text-[var(--text-secondary)]">Total Pendapatan</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">Rp {(totalPayments._sum.amount || 0).toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">Pendaftar Terbaru (Menunggu Verifikasi)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--text-secondary)] text-sm">
                <th className="pb-3 px-2">Nama</th>
                <th className="pb-3 px-2">Role Saat Ini</th>
                <th className="pb-3 px-2">Waktu Daftar</th>
                <th className="pb-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations.map(user => (
                <tr key={user.id} className="border-b border-gray-200/20 last:border-0 hover:bg-black/5 transition">
                  <td className="py-3 px-2 text-sm">{user.name}</td>
                  <td className="py-3 px-2 text-sm">
                    <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-600 text-xs font-bold">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-[var(--text-secondary)]">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button className="px-3 py-1 bg-[var(--accent)] text-white text-xs rounded neu-flat hover:opacity-90">
                      Verifikasi
                    </button>
                  </td>
                </tr>
              ))}
              {recentRegistrations.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-[var(--text-secondary)]">
                    Belum ada pendaftar baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
