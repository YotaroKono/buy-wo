import { AccessToken } from 'domain/models/auth/AccessToken';
import { RefreshToken } from 'domain/models/auth/RefreshToken';
import { SupabaseToken } from 'domain/models/auth/SupabaseToken';
import { UserId } from 'domain/models/user/UserId';
import jwt from 'jsonwebtoken';

// トークン生成のドメインサービス
export class TokenService{
  // デフォルトの有効期限（1時間）
  private static readonly DEFAULT_EXPIRATION_SECONDS = 60 * 60;

  constructor(private readonly jwtSecret: string, private readonly auth0Domain: string) {
    if (!jwtSecret) {
      throw new Error('JWT秘密鍵が設定されていません');
    }
    if (!auth0Domain) {
      throw new Error('Auth0ドメインが設定されていません');
    }
  }

  /**
   * SupabaseトークンをユーザーIDから生成する
   */
  generateSupabaseToken(userId: UserId): SupabaseToken {
    const payload = {
      userId: userId.getValue(),
      exp: Math.floor(Date.now() / 1000) + TokenService.DEFAULT_EXPIRATION_SECONDS,
    };

    const token = jwt.sign(payload, this.jwtSecret);
    return SupabaseToken.create(token, TokenService.DEFAULT_EXPIRATION_SECONDS);
  }

  /**
   * Auth0のリフレッシュトークンからアクセストークンを更新する
   */
  async refreshAccessToken(refreshToken: RefreshToken): Promise<AccessToken> {
    const response = await fetch(
      `https://${this.auth0Domain}/oauth/token`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.AUTH0_CLIENT_ID ?? '',
          client_secret: process.env.AUTH0_CLIENT_SECRET ?? '',
          refresh_token: refreshToken.getToken(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`トークン更新に失敗しました: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.access_token || !data.expires_in) {
      throw new Error('トークン更新のレスポンスが不正です');
    }

    return AccessToken.create(data.access_token, data.expires_in);
  }
}
