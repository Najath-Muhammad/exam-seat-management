import { IAuthService, ILoginResult } from '../interfaces/IAuthService';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { UnauthorizedError } from '../../errors';
import { comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/token';
import { redisClient } from '../../config/redis';

export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  private getRedisKey(userId: string, token: string): string {
    return `rt:${userId}:${token}`;
  }

  async login(email: string, passwordPlain: string): Promise<ILoginResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials or inactive account');
    }

    const isMatch = await comparePassword(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials or inactive account');
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in Redis with 7 days expiration (matching JWT)
    const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days
    await redisClient.setEx(this.getRedisKey(user.id, refreshToken), expiresInSeconds, 'valid');

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshTokens(oldRefreshToken: string): Promise<ILoginResult> {
    // 1. Verify JWT signature & expiration
    const payload = verifyRefreshToken(oldRefreshToken);
    const userId = payload.userId;

    // 2. Check if refresh token exists in Redis
    const redisKey = this.getRedisKey(userId, oldRefreshToken);
    const isValid = await redisClient.get(redisKey);

    if (!isValid) {
      // Possible token reuse or revoked session
      // For tight security, we could revoke ALL sessions for this user here.
      // await this.revokeAllUserTokens(userId);
      throw new UnauthorizedError('Invalid or expired refresh session');
    }

    // 3. Verify user is still active
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User inactive or deleted');
    }

    // 4. Rotate token (Delete old, issue new)
    await redisClient.del(redisKey);

    const newPayload = { userId: user.id, role: user.role };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    const expiresInSeconds = 7 * 24 * 60 * 60;
    await redisClient.setEx(this.getRedisKey(userId, newRefreshToken), expiresInSeconds, 'valid');

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const redisKey = this.getRedisKey(userId, refreshToken);
    await redisClient.del(redisKey);
  }

  async getUserById(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
