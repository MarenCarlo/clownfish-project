import { config } from '@/lib/config';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { authDb } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

const secretToken = config.auth.jwtSecret as string;

export async function PATCH() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { status: 401, error: true, message: 'No refresh token' },
      { status: 401 }
    );
  }

  let decoded: JwtPayload;
  try {
    const verified = jwt.verify(refreshToken, secretToken);
    if (typeof verified !== 'object' || verified === null) {
      return NextResponse.json(
        { status: 401, error: true, message: 'Refresh Token inválido' },
        { status: 401 }
      );
    }
    decoded = verified;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        status: 401,
        error: true,
        message: `Refresh Token inválido o expirado: ${message}`,
      },
      { status: 401 }
    );
  }

  try {
    const [rows] = await authDb.execute<RowDataPacket[]>(
      'SELECT id, username, is_active, first_name, last_name, email FROM auth_user WHERE id = ? AND is_active = 1 LIMIT 1',
      [decoded.userId]
    );

    if (!rows || rows.length === 0) {
      cookieStore.delete('token');
      cookieStore.delete('refreshToken');
      return NextResponse.json(
        { status: 401, error: true, message: 'Sesión inválida o expirada.' },
        { status: 401 }
      );
    }

    const user = rows[0]!;

    const accessTokenPayload = {
      userId: user.id,
      userName: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    };

    const newAccessToken = jwt.sign(accessTokenPayload, secretToken, {
      expiresIn: '15m',
    });

    const response = NextResponse.json({
      status: 200,
      error: false,
      message: 'Sesión actualizada',
    });

    cookieStore.set({
      name: 'token',
      value: newAccessToken,
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: 500,
        error: true,
        message: 'Error actualizando sesión',
        data: { error: err instanceof Error ? err.message : String(err) },
      },
      { status: 500 }
    );
  }
}
