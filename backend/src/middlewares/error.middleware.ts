import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../utils/logger';
import { env } from '../config/environment';
import { HttpStatus } from '../constants/statusCodes';
import { AppMessages } from '../constants/messages';
import { ApiResponse } from '../types/api.types';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Programming or unknown error:', err);
    }
    
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    } as any);
    return;
  }

  
  logger.error('Unexpected error:', err);

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: AppMessages.INTERNAL_ERROR,
    ...(env.NODE_ENV === 'development' && { 
      errors: err.message,
      stack: err.stack 
    }),
  } as any);
};
