import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import SecurityManager from '@/middlewares/SecurityManager';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { status: 401, error: true, message: 'No session token found' },
      { status: 401 }
    );
  }

  const decodedToken = await SecurityManager.validateToken(token);

  if (!decodedToken) {
    return NextResponse.json(
      { status: 401, error: true, message: 'Invalid or expired session' },
      { status: 401 }
    );
  }

  return NextResponse.json({ status: 200, error: false, data: decodedToken });
}
