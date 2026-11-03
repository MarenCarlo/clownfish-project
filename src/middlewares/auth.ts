import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';
import crypto from 'crypto';
import { authDb } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export interface AuthUser {
  id: number;
  username: string;
  is_active: boolean;
  first_name: string;
  last_name: string;
  email: string;
}

const secretToken = config.auth.jwtSecret as string;

/**
 * Valida un texto plano contra un hash almacenado por Django (pbkdf2_sha256).
 */
export function verifyDjangoPassword(password: string, encodedHash: string): boolean {
  try {
    if (!encodedHash || !encodedHash.startsWith('pbkdf2_sha256$')) {
      return false;
    }
    const parts = encodedHash.split('$');
    if (parts.length !== 4) return false;
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const hash = parts[3];
    // Django pbkdf2_sha256 usa hash de longitud 32 bytes
    const key = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
    const generatedHash = key.toString('base64');
    return hash === generatedHash;
  } catch (error) {
    console.error('Error verificando hash de password Django:', error);
    return false;
  }
}

/**
 * Autentica un usuario consultando la tabla auth_user de Django en la base de datos MySQL (oasis_one).
 */
export async function authenticateUser(
  username: string,
  password: string
): Promise<AuthUser | null> {
  if (!username || !password) return null;
  try {
    const [rows] = await authDb.execute<RowDataPacket[]>(
      'SELECT id, username, password, is_active, first_name, last_name, email FROM auth_user WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    );
    if (!rows || rows.length === 0) return null;
    const user = rows[0];
    if (!user.is_active) return null;

    const isValid = verifyDjangoPassword(password, user.password);
    if (isValid) {
      return {
        id: user.id,
        username: user.username,
        is_active: Boolean(user.is_active),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      };
    }
    return null;
  } catch (error) {
    console.error('Error autenticando usuario en BD oasis_one:', error);
    return null;
  }
}

/**
 * Helper interno para leer y validar el token dentro del request scope
 */
async function getDecodedToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, secretToken);
  } catch {
    return null;
  }
}

/**
 * Valida que el usuario esté autenticado y retorna sus datos
 */
export async function getAuthUser() {
  return await getDecodedToken();
}
