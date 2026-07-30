import { Response } from 'express';
import { HttpStatusCode } from '../constants/statusCodes';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: HttpStatusCode,
  message: string,
  data?: T
): void => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data !== undefined && { data })
  };
  res.status(statusCode).json(response);
};
