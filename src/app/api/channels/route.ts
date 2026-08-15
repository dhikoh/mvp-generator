import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { globalRateLimiter } from '@/lib/rateLimit';

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate Limiting
    const rateLimit = globalRateLimiter.check(`channels_${session.user.id}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
        { status: 429, headers: { 'Retry-After': rateLimit.reset.getTime().toString() } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: { select: { channels: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check tier limits
    let maxChannels = 1;
    if (user.role === 'USER_PRO') maxChannels = 3;
    if (user.role === 'USER_ULTRA' || user.role === 'SUPERADMIN') maxChannels = 10;

    if (user._count.channels >= maxChannels) {
      return NextResponse.json(
        { error: 'Batas pembuatan channel tercapai untuk Tier Anda.' },
        { status: 403 }
      );
    }

    const data = await req.json();

    if (!data.channelName || typeof data.channelName !== 'string') {
      return NextResponse.json({ error: 'Nama Channel tidak valid' }, { status: 400 });
    }

    if (data.channelName.length > 50) {
      return NextResponse.json({ error: 'Nama Channel maksimal 50 karakter' }, { status: 400 });
    }

    if (data.niche && (typeof data.niche !== 'string' || data.niche.length > 100)) {
      return NextResponse.json({ error: 'Niche maksimal 100 karakter' }, { status: 400 });
    }

    if (data.description && (typeof data.description !== 'string' || data.description.length > 500)) {
      return NextResponse.json({ error: 'Deskripsi maksimal 500 karakter' }, { status: 400 });
    }

    const newChannel = await prisma.profileChannel.create({
      data: {
        userId: user.id,
        channelName: data.channelName,
        niche: data.niche || '',
        description: data.description || '',
        visualAesthetic: data.visualAesthetic || 'realistis',
        audioBGM: data.audioBGM ?? true,
        audioSFX: data.audioSFX ?? true,
        audioVO: data.audioVO ?? true
      }
    });

    return NextResponse.json({ success: true, channel: newChannel }, { status: 201 });
  } catch (error: any) {
    console.error('Channel Creation Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
