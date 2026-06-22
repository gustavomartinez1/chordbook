import { NextResponse } from 'next/server';
import { generateAdminToken } from '@/shared/lib/admin-check';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    const adminPin = process.env.ADMIN_PIN ?? '1234';

    if (pin === adminPin) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('chordbook_admin_token', generateAdminToken(), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 horas
      });
      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
