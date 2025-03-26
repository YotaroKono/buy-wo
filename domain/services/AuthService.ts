
import { redirect } from '@remix-run/node';
import { User } from 'domain/models/user/User';
import { commitSession, getSession } from '~/utils/auth.server';
import { UserId } from 'domain/models/user/UserId';
import { AccessToken } from 'domain/models/auth/AccessToken';
import { RefreshToken } from 'domain/models/auth/RefreshToken';
import { TokenService } from './TokenService';

// 認証に関するサービス
export class AuthService {
  constructor(private readonly tokenService: TokenService) {}

  async getUserFromRequest(request: Request): Promise<User | null> {
    const session = await getSession(request.headers.get('Cookie'));
    const userSession = session.get('user');

    if (!userSession) {
      return null;
    }

    try {
      // セッションからユーザーオブジェクトを復元
      const userId = UserId.create(userSession.userId);
      const accessToken = AccessToken.restore(
        userSession.accessToken,
        userSession.expiresAt
      );

      let user = User.create(userId, accessToken);

      // リフレッシュトークンがあれば復元
      if (userSession.refreshToken) {
        const refreshToken = RefreshToken.create(userSession.refreshToken);
        user = user.withUpdatedRefreshToken(refreshToken);
      }

      // Supabaseトークンがあれば復元
      if (userSession.supabaseToken && userSession.supabaseTokenExpiresAt) {
        const supabaseToken = this.tokenService.generateSupabaseToken(userId);
        user = user.withUpdatedSupabaseToken(supabaseToken);
      }

      return user;
    } catch (error) {
      console.error('Failed to restore user from session:', error);
      return null;
    }
  }

  async ensureValidAccessToken(request: Request): Promise<string> {
    const session = await getSession(request.headers.get('Cookie'));
    const user = await this.getUserFromRequest(request);

    if (!user) {
      throw redirect('/login');
    }

    // トークンの有効期限チェック（5分の余裕を持たせる）
    const accessToken = user.getAccessToken();
    const expiresInMs = accessToken.getExpiresAt().getTime() - Date.now();
    const isExpiringSoon = expiresInMs < 5 * 60 * 1000;

    if (isExpiringSoon && user.hasRefreshToken()) {
      // トークンを更新
      const refreshToken = user.getRefreshToken()!;
      const newAccessToken = await this.tokenService.refreshAccessToken(refreshToken);
      
      // ユーザー情報を更新
      const updatedUser = user.withUpdatedAccessToken(newAccessToken);
      
      // セッションの更新
      session.set('user', this.userToSessionData(updatedUser));
      
      // セッションの保存とリダイレクト
      throw redirect(request.url, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }

    return accessToken.getToken();
  }

  private userToSessionData(user: User): Record<string, any> {
    const sessionData: Record<string, any> = {
      userId: user.userId.getValue(),
      accessToken: user.getAccessToken().getToken(),
      expiresAt: user.getAccessToken().getExpiresAt().getTime(),
    };

    if (user.hasRefreshToken()) {
      sessionData.refreshToken = user.getRefreshToken()!.getToken();
    }

    if (user.getSupabaseToken()) {
      const supabaseToken = user.getSupabaseToken()!;
      sessionData.supabaseToken = supabaseToken.getToken();
      sessionData.supabaseTokenExpiresAt = supabaseToken.getExpiresAt().getTime();
    }

    return sessionData;
  }
}
