import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type JWTPayload = {
  userId: string;
  email: string;
  role: string;
};

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET as jwt.Secret) as JWTPayload;
  } catch {
    return null;
  }
}

export function generateResetToken(userId: string): string {
  return jwt.sign({ userId, type: 'reset' }, env.JWT_SECRET as jwt.Secret, {
    expiresIn: '1h'
  });
}

export function verifyResetToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as jwt.Secret) as any;
    if (decoded.type !== 'reset') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

