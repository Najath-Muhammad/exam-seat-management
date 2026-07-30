import { Request, Response, NextFunction } from 'express';
import { IAuthenticatedRequest, UserRole } from '../types/auth.types';
import { ForbiddenError } from '../errors';

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as IAuthenticatedRequest;
    if (!authReq.user || !allowedRoles.includes(authReq.user.role)) {
      next(new ForbiddenError('Access denied: insufficient permissions'));
      return;
    }
    next();
  };
};
