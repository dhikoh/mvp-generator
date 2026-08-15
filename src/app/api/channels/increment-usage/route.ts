import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

import prisma from "@/lib/prisma";
import { enforceChannelLimits } from '@/lib/channelLockLogic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    if (!data.channelId) {
      return NextResponse.json({ error: 'Channel ID wajib diisi' }, { status: 400 });
    }

    // Verify ownership and get user credits
    const channel = await prisma.profileChannel.findUnique({
      where: { id: data.channelId },
      include: { user: true }
    });

    if (!channel || channel.userId !== session.user.id) {
      return NextResponse.json({ error: 'Channel tidak ditemukan atau bukan milik Anda' }, { status: 404 });
    }

    // Pengecekan On-The-Fly: Kadaluarsa Langganan
    const isSuperadmin = channel.user.role === 'SUPERADMIN';
    if (!isSuperadmin) {
      const isExpired = !channel.user.billingActiveUntil || new Date(channel.user.billingActiveUntil) < new Date();
      if (isExpired) {
        // Panggil lock logic untuk men-downgrade limit channel secara background
        await enforceChannelLimits(session.user.id);
        
        // Refresh status channel setelah dipaksa lock
        const refreshedChannel = await prisma.profileChannel.findUnique({ where: { id: data.channelId } });
        if (refreshedChannel?.isLocked) {
           return NextResponse.json({ error: 'Masa berlangganan habis dan channel ini terkunci. Silakan perpanjang langganan.' }, { status: 403 });
        }
      }

      if (channel.user.creditBalance <= 0) {
        return NextResponse.json({ error: 'Credit point Anda habis. Silakan top-up paket berlangganan.' }, { status: 403 });
      }
    }

    if (channel.isLocked) {
      return NextResponse.json({ error: 'Channel terkunci' }, { status: 403 });
    }

    // Execute transaction to ensure both updates succeed
    await prisma.$transaction(async (tx) => {
      await tx.profileChannel.update({
        where: { id: data.channelId },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      });

      if (channel.user.role !== 'SUPERADMIN') {
        await tx.user.update({
          where: { id: session.user.id },
          data: { creditBalance: { decrement: 1 } }
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Increment Usage Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
