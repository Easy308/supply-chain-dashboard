import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'accounting-app-secret-key-2024';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string; email: string };
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token 无效或已过期' });
  }
}

export function generateToken(userId: number, username: string, email: string): string {
  return jwt.sign({ userId, username, email }, JWT_SECRET, { expiresIn: '7d' });
}

export { JWT_SECRET };
