import { sendResponse } from '../../utils/response.util';
import { AppMessages } from '../../constants/messages';
import { Request, Response, NextFunction } from 'express';
import { IAuthController } from '../interfaces/IAuthController';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { HttpStatus } from '../../constants/statusCodes';
import { env } from '../../config/environment';
import { IAuthenticatedRequest } from '../../types/auth.types';

export class AuthController implements IAuthController {
  constructor(private readonly authService: IAuthService) {}

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth', // Restrict cookie to auth endpoints
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
    });
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DEBUG] login request received');
      const { email, password } = req.body;
      console.log('[DEBUG] calling authService.login');
      const result = await this.authService.login(email, password);
      console.log('[DEBUG] setting refresh cookie');
      this.setRefreshCookie(res, result.refreshToken);

      sendResponse(res, HttpStatus.OK, AppMessages.LOGIN_SUCCESSFUL, {
          accessToken: result.accessToken,
          user: result.user,
        },);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        sendResponse(res, HttpStatus.UNAUTHORIZED, AppMessages.REFRESH_TOKEN_MISSING);
        return;
      }

      const result = await this.authService.refreshTokens(refreshToken);

      this.setRefreshCookie(res, result.refreshToken);

      sendResponse(res, HttpStatus.OK, AppMessages.TOKEN_REFRESHED, {
          accessToken: result.accessToken,
          user: result.user,
        },);
    } catch (error) {
      // If refresh fails, clear the cookie
      this.clearRefreshCookie(res);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      // Depending on auth flow, logout can also verify the access token first, 
      // but here we just need the refresh token to revoke it.
      if (refreshToken) {
        // Decode it roughly just to get userId, or better, pass the whole token to auth service
        // Since verifyRefreshToken throws if invalid, we just decode to get user id safely or let service handle it.
        // Wait, logout might not have access token, so we just decode refresh token:
        import('jsonwebtoken').then(({ decode }) => {
          const decoded = decode(refreshToken) as any;
          if (decoded && decoded.userId) {
            this.authService.logout(decoded.userId, refreshToken).catch(console.error);
          }
        });
      }

      this.clearRefreshCookie(res);

      sendResponse(res, HttpStatus.OK, AppMessages.LOGOUT_SUCCESSFUL);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as IAuthenticatedRequest;
      const userId = authReq.user!.userId;
      const user = await this.authService.getUserById(userId);

      sendResponse(res, HttpStatus.OK, AppMessages.USER_DETAILS_FETCHED, { user },);
    } catch (error) {
      next(error);
    }
  }
}
