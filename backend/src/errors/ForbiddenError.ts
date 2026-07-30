import { AppError } from './AppError';
import { HttpStatus } from '../constants/statusCodes';
import { AppMessages } from '../constants/messages';

export class ForbiddenError extends AppError {
  constructor(message: string = AppMessages.FORBIDDEN) {
    super(message, HttpStatus.FORBIDDEN, true);
  }
}
