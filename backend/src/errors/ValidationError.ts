import { AppError } from './AppError';
import { HttpStatus } from '../constants/statusCodes';
import { AppMessages } from '../constants/messages';

export class ValidationError extends AppError {
  constructor(message: string = AppMessages.VALIDATION_ERROR, errors?: any) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, true, errors);
  }
}
