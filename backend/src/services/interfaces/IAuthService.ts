import { TAny } from '../../types/any';
export interface ILoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface IAuthService {
  login(email: string, passwordPlain: string): Promise<ILoginResult>;
  refreshTokens(refreshToken: string): Promise<ILoginResult>;
  logout(userId: string, refreshToken: string): Promise<void>;
  getUserById(userId: string): Promise<TAny>;
}
