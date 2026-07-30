import { AppError } from './AppError';
import { HttpStatus } from '../constants/statusCodes';
import { AppMessages } from '../constants/messages';

export class UnauthorizedError extends AppError {
  constructor(message: string = AppMessages.UNAUTHORIZED) {
    super(message, HttpStatus.UNAUTHORIZED, true);
  }
}
