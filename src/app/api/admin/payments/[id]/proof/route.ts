import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    const payment = await prisma.billingHistory.findUnique({
      where: { id },
      select: { proofUrl: true }
    });

    if (!payment || !payment.proofUrl) {
      return NextResponse.json({ error: 'Proof not found' }, { status: 404 });
    }

    // Ekstrak tipe MIME dan base64 string
    // Format yang diharapkan: data:image/png;base64,iVBORw0KGgo...
    const matches = payment.proofUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error: any) {
    console.error('Fetch Proof Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
