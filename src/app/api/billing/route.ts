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
    const rateLimit = globalRateLimiter.check(`billing_${session.user.id}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
        { status: 429, headers: { 'Retry-After': rateLimit.reset.getTime().toString() } }
      );
    }

    const data = await req.json();
    const { amount, tier, proofUrl } = data;

    if (!amount || !tier || !proofUrl) {
      return NextResponse.json({ error: 'Data pembayaran tidak lengkap' }, { status: 400 });
    }

    // XSS PROTECTION: Validasi ketat format Base64 Image
    // Hanya menerima JPG dan PNG
    const base64Regex = /^data:image\/(jpeg|png|jpg);base64,([a-zA-Z0-9+/=]+)$/;
    if (!base64Regex.test(proofUrl)) {
      return NextResponse.json({ error: 'Format file tidak didukung atau rentan (XSS)' }, { status: 400 });
    }

    // Estimasi ukuran string Base64 ke bytes (Kasar)
    const base64Length = proofUrl.length - (proofUrl.indexOf(',') + 1);
    const sizeInBytes = Math.ceil((base64Length * 3) / 4);
    if (sizeInBytes > 2.5 * 1024 * 1024) { // Beri buffer sedikit jadi 2.5MB
      return NextResponse.json({ error: 'Ukuran file melebihi 2MB' }, { status: 413 });
    }

    const billingRecord = await prisma.billingHistory.create({
      data: {
        userId: session.user.id,
        amount,
        tier,
        proofUrl, 
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, record: billingRecord }, { status: 201 });
  } catch (error: any) {
    console.error('Billing Submission Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

