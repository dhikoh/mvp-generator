import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

import { enforceChannelLimits } from '@/lib/channelLockLogic';
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { paymentId, status } = await req.json();

    if (!paymentId || !status) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Get the payment
    const payment = await prisma.billingHistory.findUnique({
      where: { id: paymentId },
      include: { user: true }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Pembayaran tidak ditemukan' }, { status: 404 });
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Pembayaran sudah diproses sebelumnya' }, { status: 400 });
    }

    // If approved, update user's role and billing active until
    if (status === 'APPROVED') {
      const now = new Date();
      const activeUntil = payment.user.billingActiveUntil && new Date(payment.user.billingActiveUntil) > now
        ? new Date(new Date(payment.user.billingActiveUntil).getTime() + 30 * 24 * 60 * 60 * 1000) // add 30 days to existing
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // add 30 days from now

      // Execute transaction to ensure atomic update and avoid race conditions
      await prisma.$transaction(async (tx) => {
        const currentPayment = await tx.billingHistory.findUnique({ where: { id: paymentId } });
        if (!currentPayment || currentPayment.status !== 'PENDING') {
          throw new Error("Payment is no longer pending");
        }

        await tx.billingHistory.update({
          where: { id: paymentId },
          data: { status: 'APPROVED' }
        });

        const tierToCredits: Record<string, number> = {
          USER_STANDARD: 50,
          USER_PRO: 200,
          USER_ULTRA: 1000
        };

        const addedCredits = tierToCredits[payment.tier] || 0;

        await tx.user.update({
          where: { id: payment.userId },
          data: {
            role: payment.tier as Role,
            billingActiveUntil: activeUntil,
            creditBalance: { increment: addedCredits }
          }
        });
      });
      
      // Enforce channel limits after payment approval
      await enforceChannelLimits(payment.userId);
    } else {
      // Just reject
      const result = await prisma.billingHistory.updateMany({
        where: { id: paymentId, status: 'PENDING' },
        data: { status: 'REJECTED' }
      });
      
      if (result.count === 0) {
        return NextResponse.json({ error: 'Pembayaran sudah diproses sebelumnya' }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.message === "Payment is no longer pending") {
      return NextResponse.json({ error: 'Pembayaran sudah diproses sebelumnya' }, { status: 400 });
    }
    console.error('Admin Payment Approval Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
