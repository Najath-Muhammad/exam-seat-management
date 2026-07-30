import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route not found - ${req.originalUrl}`));
};
