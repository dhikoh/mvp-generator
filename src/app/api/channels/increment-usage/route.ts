import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

import prisma from "@/lib/prisma";

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

    // Verify ownership
    const channel = await prisma.profileChannel.findUnique({
      where: { id: data.channelId }
    });

    if (!channel || channel.userId !== session.user.id) {
      return NextResponse.json({ error: 'Channel tidak ditemukan atau bukan milik Anda' }, { status: 404 });
    }

    if (channel.isLocked) {
      return NextResponse.json({ error: 'Channel terkunci' }, { status: 403 });
    }

    await prisma.profileChannel.update({
      where: { id: data.channelId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Increment Usage Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
