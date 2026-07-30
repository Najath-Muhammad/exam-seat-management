import { AppError } from './AppError';
import { HttpStatus } from '../constants/statusCodes';

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', errors?: any) {
    super(message, HttpStatus.BAD_REQUEST, true, errors);
  }
}
