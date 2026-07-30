import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { IJwtPayload } from '../types/auth.types';
import { UnauthorizedError } from '../errors';import { TAny } from '../types/any';


export const generateAccessToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as TAny,
  });
};

export const generateRefreshToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as TAny,
  });
};

export const verifyAccessToken = (token: string): IJwtPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as IJwtPayload;
  } catch (_error) {
    throw new UnauthorizedError('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): IJwtPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as IJwtPayload;
  } catch (_error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};
