import { User } from "domain/models/user/User";
import { TokenService } from "./TokenService";
import { UserId } from "domain/models/user/UserId";
import { AccessToken } from "domain/models/auth/AccessToken";
import { RefreshToken } from "domain/models/auth/RefreshToken";
import { IUserRepository } from "domain/models/user/IUserRepository";


export class UserService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Auth0プロファイルからUserエンティティを生成し、必要に応じてSupabaseにも保存する
   */
  async createFromAuth0Profile(profileData: {
    userId: string;
    email: string;
    accessToken: string;
    refreshToken?: string;
    expiresIn: Date;
    name?: string;
    picture?: string;
  }): Promise<User> {
    // 値オブジェクト生成
    const userId = UserId.create(profileData.userId);
    const accessToken = AccessToken.create(profileData.accessToken, profileData.expiresIn);
    
    // ユーザーオブジェクト初期化 - email, name, pictureも含める
    let user = User.create(
      userId, 
      accessToken,
      undefined,
      undefined,
      profileData.name,
      profileData.picture,
      profileData.email, 

    );
    
    // リフレッシュトークンが提供されていれば追加
    if (profileData.refreshToken) {
      const refreshToken = RefreshToken.create(profileData.refreshToken);
      user = user.withUpdatedRefreshToken(refreshToken);
    }
    
    // Supabaseトークンを生成
    const supabaseToken = this.tokenService.generateSupabaseToken(userId);
    user = user.withUpdatedSupabaseToken(supabaseToken);
    
    // Supabaseにユーザー情報を保存
    await this.ensureUserInSupabase(user);

    const refreshTokenInstance = user.getRefreshToken();
    const refreshToken = refreshTokenInstance ? refreshTokenInstance.getToken() : undefined;

    
    
    return {
      userId: userId,
      email: profileData.email,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: AccessToken?.getExpiresAt(),
      supabaseToken: supabaseToken,
    };
  }
  
  private async ensureUserInSupabase(user: User): Promise<void> {
    const supabaseToken = user.getSupabaseToken();
    if (!supabaseToken) {
      throw new Error('Supabaseトークンがありません');
    }
    
    // リポジトリからユーザーを検索
    const existingUser = await this.userRepository.find(
      user.userId, 
      supabaseToken
    );
    
    // ユーザーが存在しない場合は新規作成
    if (!existingUser) {
      // リポジトリに直接ユーザーを保存
      await this.userRepository.save(user, supabaseToken);
    }
  }
}
