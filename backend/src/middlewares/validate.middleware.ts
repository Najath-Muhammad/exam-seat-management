import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        
        const formattedErrors = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError(undefined, formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
