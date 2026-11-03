import { config } from '@/lib/config';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { authenticateUser } from '@/middlewares/auth';
import { secondsToMidnight } from '@/utils/secondsToMidnight';

const secretToken = config.auth.jwtSecret as string;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nameUser = body.nameUser || body.username || body.email;
    const passUser = body.passUser || body.password;

    if (!nameUser || !passUser) {
      return NextResponse.json(
        { status: 400, error: true, message: 'Faltan credenciales', data: {} },
        { status: 400 }
      );
    }

    const user = await authenticateUser(String(nameUser).trim(), String(passUser));

    if (!user) {
      return NextResponse.json(
        {
          status: 400,
          error: true,
          message: 'Usuario no existe, está inactivo o la contraseña es incorrecta.',
          data: {},
        },
        { status: 400 }
      );
    }

    const accessTokenPayload = {
      userId: user.id,
      userName: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    };

    const refreshTokenPayload = {
      userId: user.id,
      jti: Date.now().toString(),
    };

    const accessToken = jwt.sign(accessTokenPayload, secretToken, {
      expiresIn: '15m',
    });

    const expirationTime = secondsToMidnight(Date.now());
    const refreshToken = jwt.sign(refreshTokenPayload, secretToken, {
      expiresIn: expirationTime,
    });

    const response = NextResponse.json({
      status: 200,
      error: false,
      message: 'Inicio de sesión exitoso.',
      data: {
        header: 'authorization',
        userName: user.username,
        userId: user.id,
      },
    });

    const cookieStore = await cookies();

    cookieStore.set({
      name: 'token',
      value: accessToken,
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    cookieStore.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: expirationTime,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: 500,
        error: true,
        message: 'Error en el servidor iniciando la sesión.',
        data: { error: error instanceof Error ? error.message : String(error) },
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('refreshToken');

  return NextResponse.json({
    status: 200,
    error: false,
    message: 'Session deleted',
  });
}
