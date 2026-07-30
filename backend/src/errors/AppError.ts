export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    errors?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}
