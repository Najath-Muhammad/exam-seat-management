import { AppError } from './AppError';
import { HttpStatus } from '../constants/statusCodes';
import { AppMessages } from '../constants/messages';

export class InternalServerError extends AppError {
  constructor(message: string = AppMessages.INTERNAL_ERROR) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }
}
