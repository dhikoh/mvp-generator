import { NextResponse } from 'next/server';

import bcrypt from 'bcrypt';

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name, username, email, phoneNumber, password, dateOfBirth,
      channelName, niche, description, cta1, cta2,
      visualAesthetic, audioBGM, audioSFX, audioVO, socialLinks
    } = body;

    // Basic validation (strict checking for empty strings)
    if (
      !name?.trim() || 
      !username?.trim() || 
      !email?.trim() || 
      !phoneNumber?.trim() || 
      !password || 
      !dateOfBirth || 
      !channelName?.trim() || 
      !description?.trim()
    ) {
      return NextResponse.json({ error: 'Data wajib tidak boleh kosong' }, { status: 400 });
    }

    // Validate date format
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return NextResponse.json({ error: 'Format tanggal lahir tidak valid' }, { status: 400 });
    }

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          { username: { equals: username, mode: 'insensitive' } },
          { phoneNumber }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
      if (existingUser.username.toLowerCase() === username.toLowerCase()) return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 409 });
      if (existingUser.phoneNumber === phoneNumber) return NextResponse.json({ error: 'Nomor HP sudah terdaftar' }, { status: 409 });
      return NextResponse.json({ error: 'Kredensial sudah terdaftar' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and profile channel in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          username,
          email,
          phoneNumber,
          passwordHash,
          dateOfBirth: dob,
          role: 'USER_DEMO',
          billingActiveUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days free trial
        }
      });

      await tx.profileChannel.create({
        data: {
          userId: user.id,
          channelName,
          niche,
          description,
          cta1,
          cta2,
          visualAesthetic,
          audioBGM: audioBGM ?? true,
          audioSFX: audioSFX ?? true,
          audioVO: audioVO ?? true,
          socialLinks: socialLinks || {}
        }
      });

      return user;
    });

    return NextResponse.json({ success: true, userId: newUser.id }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
