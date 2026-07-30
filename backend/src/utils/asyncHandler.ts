import { Request, Response, NextFunction } from 'express';import { TAny } from '../types/any';


type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<TAny>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
