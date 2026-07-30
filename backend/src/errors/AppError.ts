import { TAny } from '../types/any';
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: TAny;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    errors?: TAny
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    
    Object.setPrototypeOf(this, new.target.prototype);

    
    Error.captureStackTrace(this, this.constructor);
  }
}
