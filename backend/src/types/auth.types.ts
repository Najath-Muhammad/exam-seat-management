import { Request } from 'express';

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF', 
}

export interface IJwtPayload {
  userId: string;
  role: UserRole;
}

export interface IAuthenticatedRequest extends Request {
  user?: IJwtPayload;
}
