import type { AccessToken } from "./AccessToken";
import type { RefreshToken } from "./RefreshToken";
import type { SupabaseToken } from "./SupabaseToken";

export class AuthTokens {
	private readonly accessToken: AccessToken;
	private readonly refreshToken: RefreshToken | null;
	private readonly supabaseToken: SupabaseToken;

	private constructor(
		accessToken: AccessToken,
		supabaseToken: SupabaseToken,
		refreshToken: RefreshToken | null = null,
	) {
		this.accessToken = accessToken;
		this.supabaseToken = supabaseToken;
		this.refreshToken = refreshToken;
	}

	/**
	 * すべてのトークンを指定して作成
	 */
	static create(
		accessToken: AccessToken,
		supabaseToken: SupabaseToken,
		refreshToken: RefreshToken | null = null,
	): AuthTokens {
		return new AuthTokens(accessToken, supabaseToken, refreshToken);
	}

	getAccessToken(): AccessToken {
		return this.accessToken;
	}

	getSupabaseToken(): SupabaseToken {
		return this.supabaseToken;
	}

	getRefreshToken(): RefreshToken | null {
		return this.refreshToken;
	}

	hasRefreshToken(): boolean {
		return this.refreshToken !== null;
	}

	/**
	 * アクセストークンを更新した新しいインスタンスを返す
	 */
	withUpdatedAccessToken(newAccessToken: AccessToken): AuthTokens {
		return new AuthTokens(
			newAccessToken,
			this.supabaseToken,
			this.refreshToken,
		);
	}

	/**
	 * Supabaseトークンを更新した新しいインスタンスを返す
	 */
	withUpdatedSupabaseToken(newSupabaseToken: SupabaseToken): AuthTokens {
		return new AuthTokens(
			this.accessToken,
			newSupabaseToken,
			this.refreshToken,
		);
	}

	/**
	 * リフレッシュトークンを更新した新しいインスタンスを返す
	 */
	withUpdatedRefreshToken(newRefreshToken: RefreshToken | null): AuthTokens {
		return new AuthTokens(
			this.accessToken,
			this.supabaseToken,
			newRefreshToken,
		);
	}

	/**
	 * すべてのトークンが有効かどうかをチェック
	 */
	isValid(): boolean {
		return !this.accessToken.isExpired() && !this.supabaseToken.isExpired();
	}
}
