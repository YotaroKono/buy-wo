import { AccessToken } from "../auth/AccessToken";
import { RefreshToken } from "../auth/RefreshToken";
import { SupabaseToken } from "../auth/SupabaseToken";
import { UserId } from "./UserId";

export class User {
    private constructor(
    private readonly _userId: UserId,
    private accessToken: AccessToken,
    private refreshToken?: RefreshToken,
    private supabaseToken?: SupabaseToken
) {}

    static create(
        userId: UserId,
        accessToken: AccessToken,
        refreshToken?: RefreshToken,
        supabaseToken?: SupabaseToken
    ): User {
        return new User(userId, accessToken, refreshToken, supabaseToken);
    }

    get userId(): UserId {
        return this._userId;
    }

    getAccessToken(): AccessToken {
        return this.accessToken;
    }

    getSupabaseToken(): SupabaseToken | undefined {
        return this.supabaseToken;
    }

    getRefreshToken(): RefreshToken | undefined {
        return this.refreshToken;
    }

    hasRefreshToken(): boolean {
        return !!this.refreshToken;
    }

    withUpdatedAccessToken(newAccessToken: AccessToken): User {
        return new User(this._userId, newAccessToken, this.refreshToken, this.supabaseToken);
    }

    withUpdatedSupabaseToken(newSupabaseToken: SupabaseToken): User {
        return new User(this._userId, this.accessToken, this.refreshToken, newSupabaseToken);
    }

    withUpdatedRefreshToken(newRefreshToken: RefreshToken): User {
        return new User(this._userId, this.accessToken, newRefreshToken, this.supabaseToken);
    }
}