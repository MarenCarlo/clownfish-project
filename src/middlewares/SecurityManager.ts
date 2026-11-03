import jwt, { type Secret, type JwtPayload } from 'jsonwebtoken';
import { config } from '@/lib/config';

const verifyJwt = (token: string): JwtPayload | null => {
  try {
    const secret = config.auth.jwtSecret as Secret;
    if (!secret) {
      console.error('JWT_TOKEN_SECRET no está definido en las variables de entorno.');
      return null;
    }
    const decoded = jwt.verify(token, secret);
    return typeof decoded === 'object' && decoded !== null ? decoded : null;
  } catch {
    return null;
  }
};

const SecurityManager = {
  async validateToken(token: string): Promise<(JwtPayload & { userIsActive: boolean }) | null> {
    const decoded = verifyJwt(token);
    if (!decoded) return null;

    return {
      ...decoded,
      userIsActive: true,
    };
  },
};

export default SecurityManager;
