import { Request } from 'express';

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF', // Placeholder for future use
}

export interface IJwtPayload {
  userId: string;
  role: UserRole;
}

export interface IAuthenticatedRequest extends Request {
  user?: IJwtPayload;
}
