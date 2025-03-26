import { SupabaseToken } from "../auth/SupabaseToken";
import { User } from "./User";
import { UserId } from "./UserId";

export interface IUserRepository {
    find(userId: UserId, token: SupabaseToken): Promise<any | null>;
    save(userData: User, token: SupabaseToken): Promise<void>;
  }