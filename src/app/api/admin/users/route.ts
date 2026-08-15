import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcrypt';
import { enforceChannelLimits } from '@/lib/channelLockLogic';

import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, action, role, days, newPassword } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    if (action === 'UPDATE_ROLE') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: role as Role }
      });
      // Call enforce channel limits if downgrading
      await enforceChannelLimits(userId);
    } 
    else if (action === 'ADD_DAYS') {
      const now = new Date();
      const activeUntil = targetUser.billingActiveUntil && new Date(targetUser.billingActiveUntil) > now
        ? new Date(new Date(targetUser.billingActiveUntil).getTime() + days * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: userId },
        data: { billingActiveUntil: activeUntil }
      });
    }
    else if (action === 'RESET_PASSWORD') {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword }
      });
    }
    else {
      return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Admin User Update Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
