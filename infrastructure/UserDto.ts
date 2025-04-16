import { User } from "domain/models/user/User";

export class UserDTO {
  readonly userId: string;
  readonly email: string;
  readonly name?: string;
  readonly picture_url?: string;
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt: number;
  readonly supabaseToken?: string;
  readonly created_at: string;
  readonly updated_at: string;

  constructor(user: User) {
    this.userId = user.userId.getValue();
    this.email = user.email;
    this.name = user.name;
    this.picture_url = user.picture_url;
    this.accessToken = user.getAccessToken().getToken();
    this.expiresAt = user.getAccessToken().getExpiresAt().getTime();
    
    if (user.hasRefreshToken()) {
      this.refreshToken = user.getRefreshToken()!.getToken();
    }
    
    if (user.getSupabaseToken()) {
      this.supabaseToken = user.getSupabaseToken()!.getToken();
    }
    
    const now = new Date().toISOString();
    this.created_at = now;
    this.updated_at = now;
  }
  
  toDatabaseModel() {
    return {
      user_id: this.userId,
      email: this.email,
      name: this.name,
      picture_url: this.picture_url,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}