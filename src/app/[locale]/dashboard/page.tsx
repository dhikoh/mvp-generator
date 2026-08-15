import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

export default async function DashboardOverview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      channels: true,
      _count: {
        select: { channels: true }
      }
    }
  });

  if (!user) return null;

  // Real-time check
  const isActive = user.role !== 'USER_DEMO' && user.billingActiveUntil && new Date(user.billingActiveUntil) > new Date();
  const daysRemaining = isActive 
    ? Math.ceil((new Date(user.billingActiveUntil!).getTime() - Date.now()) / (1000 * 3600 * 24))
    : 0;

  // Tier limits logic
  let maxChannels = 1;
  if (user.role === 'USER_PRO') maxChannels = 3;
  if (user.role === 'USER_ULTRA' || user.role === 'SUPERADMIN') maxChannels = 10;

  // Calculate total generates
  const totalGenerates = user.channels.reduce((sum: number, channel: { usageCount: number }) => sum + channel.usageCount, 0);

  return (
    <div className="space-y-6 pb-6">
      <div className="glass-panel p-6 rounded-3xl flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Halo, {user.name}! 👋</h1>
          <p className="text-sm text-[var(--text-secondary)]">Siap untuk menciptakan prompt menakjubkan hari ini?</p>
        </div>
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[var(--accent)] rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neu-flat p-4 rounded-2xl flex flex-col justify-center">
          <span className="text-xs text-[var(--text-secondary)] font-medium mb-1">Status Billing</span>
          {isActive ? (
            <span className="text-lg font-bold text-green-500">Aktif ({daysRemaining} Hari)</span>
          ) : (
            <span className="text-lg font-bold text-red-500">{user.role === 'USER_DEMO' ? 'Unverified' : 'Kedaluwarsa'}</span>
          )}
        </div>
        <div className="neu-flat p-4 rounded-2xl flex flex-col justify-center">
          <span className="text-xs text-[var(--text-secondary)] font-medium mb-1">Tier Saat Ini</span>
          <span className="text-lg font-bold text-[var(--accent)]">{user.role.replace('USER_', '')}</span>
        </div>
        <div className="neu-flat p-4 rounded-2xl flex flex-col justify-center">
          <span className="text-xs text-[var(--text-secondary)] font-medium mb-1">Slot Channel</span>
          <span className="text-lg font-bold">{user._count.channels} / {maxChannels}</span>
        </div>
        <div className="neu-flat p-4 rounded-2xl flex flex-col justify-center">
          <span className="text-xs text-[var(--text-secondary)] font-medium mb-1">Total Generate</span>
          <span className="text-lg font-bold">{totalGenerates}</span>
        </div>
      </div>

      {/* Daily Missions */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold flex items-center space-x-2">
          <span>🎯</span> <span>Misi Harian Anda</span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Selesaikan misi untuk memacu konsistensi ngonten Anda!</p>
        
        <div className="space-y-3">
          <div className={`p-3 rounded-xl flex justify-between items-center ${totalGenerates > 0 ? 'neu-pressed bg-transparent' : 'neu-flat opacity-70'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${totalGenerates > 0 ? 'bg-[var(--accent)] text-white' : 'border-2 border-[var(--text-secondary)] text-transparent'}`}>✓</div>
              <div>
                <p className="text-sm font-semibold">Generate Prompt Pertama</p>
                <p className="text-xs text-[var(--text-secondary)]">{totalGenerates > 0 ? 'Selesai' : 'Belum selesai'}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-3 rounded-xl flex justify-between items-center ${user._count.channels > 1 ? 'neu-pressed bg-transparent' : 'neu-flat opacity-70'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${user._count.channels > 1 ? 'bg-[var(--accent)] text-white' : 'border-2 border-[var(--text-secondary)] text-transparent'}`}>✓</div>
              <div>
                <p className="text-sm font-semibold">Buat Profile Channel Kedua</p>
                <p className="text-xs text-[var(--text-secondary)]">{user._count.channels > 1 ? 'Selesai' : 'Belum Selesai'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
