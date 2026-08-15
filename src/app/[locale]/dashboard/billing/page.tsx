
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import prisma from "@/lib/prisma";

import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const history = await prisma.billingHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 pb-6">
      <div className="glass-panel p-6 rounded-3xl">
        <h2 className="text-2xl font-bold mb-1">Billing & Top Up</h2>
        <p className="text-sm text-[var(--text-secondary)]">Kelola paket langganan Anda dan perpanjang masa aktif.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Up Form / Packages */}
        <BillingClient />

        {/* History */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4">Riwayat Transaksi</h3>
          <div className="space-y-3">
            {history.map((item: { id: string; tier: string; createdAt: Date; amount: number; status: string }) => (
              <div key={item.id} className="p-3 rounded-xl neu-pressed flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{item.tier}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--accent)] text-sm">Rp {item.amount.toLocaleString('id-ID')}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'APPROVED' ? 'bg-green-500/20 text-green-600' :
                    item.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-600' :
                    'bg-red-500/20 text-red-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)] text-center py-4">Belum ada riwayat transaksi.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
