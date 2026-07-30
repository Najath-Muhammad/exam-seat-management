import { AppError } from './AppError';
import { HttpStatus } from '../constants/statusCodes';
import { AppMessages } from '../constants/messages';

export class NotFoundError extends AppError {
  constructor(message: string = AppMessages.NOT_FOUND) {
    super(message, HttpStatus.NOT_FOUND, true);
  }
}
