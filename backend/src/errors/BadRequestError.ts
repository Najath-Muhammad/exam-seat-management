import { AppError } from './AppError';
import { HttpStatus } from '../constants/statusCodes';import { TAny } from '../types/any';


export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', errors?: TAny) {
    super(message, HttpStatus.BAD_REQUEST, true, errors);
  }
}
