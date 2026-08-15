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

    // Basic validation
    if (!name || !username || !email || !phoneNumber || !password || !dateOfBirth || !channelName || !niche || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
          { phoneNumber }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username, Email, or Phone Number already exists' }, { status: 409 });
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
          dateOfBirth: new Date(dateOfBirth),
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
