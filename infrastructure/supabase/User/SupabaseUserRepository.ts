import { SupabaseToken } from "domain/models/auth/SupabaseToken";
import { IUserRepository } from "domain/models/user/IUserRepository";
import { UserId } from "domain/models/user/UserId";

// Supabase実装
export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly getClientFn: (token: string) => any) {}

  async find(userId: UserId, token: SupabaseToken): Promise<any | null> {
    const tokenString = token.getToken();
    const supabase = this.getClientFn(tokenString);
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw new Error(`ユーザー検索中にエラーが発生しました: ${error.message}`);
    }
    
    return data;
  }

  async save(userData: any, token: SupabaseToken): Promise<void> {
    const tokenString = token.getToken();
    const supabase = this.getClientFn(tokenString);
    const { error } = await supabase
      .from('user')
      .insert([userData]);
      
    if (error) {
      throw new Error(`ユーザー作成中にエラーが発生しました: ${error.message}`);
    }
  }
}