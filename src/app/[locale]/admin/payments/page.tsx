
import PaymentVerificationClient from "./PaymentVerificationClient";

import prisma from "@/lib/prisma";

export default async function AdminPaymentsPage() {
  const pendingPayments = await prisma.billingHistory.findMany({
    where: { status: 'PENDING' },
    select: { 
      id: true, amount: true, tier: true, status: true, createdAt: true,
      user: { select: { name: true, username: true, role: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });

  const historyPayments = await prisma.billingHistory.findMany({
    where: { status: { not: 'PENDING' } },
    select: { 
      id: true, amount: true, tier: true, status: true, createdAt: true,
      user: { select: { name: true, username: true } } 
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-1">Verifikasi Pembayaran</h2>
        <p className="text-sm text-[var(--text-secondary)]">Tinjau bukti transfer dan setujui penambahan masa aktif user.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <PaymentVerificationClient pending={pendingPayments} history={historyPayments} />
      </div>
    </div>
  );
}


