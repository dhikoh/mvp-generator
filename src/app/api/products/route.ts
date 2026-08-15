import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { productRateLimiter } from '@/lib/rateLimit';

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const rateLimit = productRateLimiter.check(`products_${ip}_${session.user.id}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak request. Silakan coba lagi nanti.' },
        { status: 429, headers: { 'Retry-After': rateLimit.reset.getTime().toString() } }
      );
    }

    const data = await req.json();

    if (!data.channelId || !data.name || !data.price) {
      return NextResponse.json({ error: 'Data produk tidak lengkap' }, { status: 400 });
    }

    // Verify channel ownership
    const channel = await prisma.profileChannel.findUnique({
      where: { id: data.channelId }
    });

    if (!channel || channel.userId !== session.user.id) {
      return NextResponse.json({ error: 'Channel tidak ditemukan atau bukan milik Anda' }, { status: 403 });
    }

    const product = await prisma.product.create({
      data: {
        channelId: data.channelId,
        name: data.name,
        description: data.description || '',
        price: parseInt(data.price),
        link: data.link || '',
      }
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error('Create Product Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID wajib diisi' }, { status: 400 });
    }

    // Verify channel ownership
    const channel = await prisma.profileChannel.findUnique({
      where: { id: channelId }
    });

    if (!channel || channel.userId !== session.user.id) {
      return NextResponse.json({ error: 'Channel tidak ditemukan atau bukan milik Anda' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      where: { channelId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error('Get Products Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
