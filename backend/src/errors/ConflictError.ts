import { AppError } from './AppError';
import { HttpStatus } from '../constants/statusCodes';

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, HttpStatus.CONFLICT, true);
  }
}
