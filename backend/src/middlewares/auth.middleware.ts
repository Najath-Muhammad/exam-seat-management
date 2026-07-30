import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { IAuthenticatedRequest } from '../types/auth.types';
import { UnauthorizedError } from '../errors';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    (req as IAuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
