import { AppError } from './AppError';
import { HttpStatus } from '../constants/statusCodes';
import { AppMessages } from '../constants/messages';import { TAny } from '../types/any';


export class ValidationError extends AppError {
  constructor(message: string = AppMessages.VALIDATION_ERROR, errors?: TAny) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, true, errors);
  }
}
