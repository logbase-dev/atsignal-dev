import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || 'admin';
const BASIC_AUTH_PASS = process.env.BASIC_AUTH_PASS || 'password';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === BASIC_AUTH_USER && password === BASIC_AUTH_PASS) {
      const cookieStore = await cookies();
      const token = Buffer.from(`${username}:${password}`).toString('base64');
      
      cookieStore.set('admin-auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: '사용자명 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

