import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, email, phoneNumber } = await req.json();

    if (!username || !email || !phoneNumber) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

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
      if (existingUser.email.toLowerCase() === email.toLowerCase()) return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login atau gunakan email lain.' }, { status: 409 });
      if (existingUser.username.toLowerCase() === username.toLowerCase()) return NextResponse.json({ error: 'Username sudah terdaftar. Silakan gunakan username lain.' }, { status: 409 });
      if (existingUser.phoneNumber === phoneNumber) return NextResponse.json({ error: 'Nomor HP sudah terdaftar. Silakan login atau gunakan nomor lain.' }, { status: 409 });
      return NextResponse.json({ error: 'Kredensial sudah terdaftar' }, { status: 409 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Check User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
