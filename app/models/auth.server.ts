import { configRouteToBranchRoute } from "@remix-run/dev/dist/vite/plugin";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import type { SystemCategory } from "~/utils/types/category";
import { getSupabaseClient } from "../models/supabase.server";
import type { User } from "../utils/types/user";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "_session", // use any name you want here
		sameSite: "lax", // this helps with CSRF
		path: "/", // remember to add this so the cookie will work in all routes
		httpOnly: true, // for security reasons, make this cookie http only
		secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
		secure: process.env.NODE_ENV === "production", // enable this in prod only
	},
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export function createSupabaseToken(userId: string): string {
	const payload = {
		role: "authenticated",
		sub: userId,
		exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間の有効期限
	};
	if (!userId) {
		throw new Error("userIdがありません");
	}
	return jwt.sign(payload, process.env.SUPABASE_JWT_SECRET);
}

const UserService = {
	async convertToUserObject(data: {
		userId: string;
		email: string;
		accessToken: string;
		refreshToken?: string;
		expiresIn: number;
		supabaseToken?: string;
		name?: string;
		picture?: string;
	}): Promise<User> {
		const supabaseToken = createSupabaseToken(data.userId);
		const supabase = getSupabaseClient(data.supabaseToken ?? supabaseToken);
		if (!supabase) {
			throw new Error("Supabase clientの生成に失敗しました");
		}
		// 管理者クライアントを使用（新規ユーザー作成用）
		const supabaseAdmin = await createAdminClient();

		// Supabaseのuserテーブルでユーザーを検索
		const { data: existingUser, error: searchError } = await supabase
			.from("user")
			.select("*")
			.eq("user_id", data.userId)
			.single();

		if (searchError && searchError.code !== "PGRST116") {
			console.error("Error searching for user:", searchError);
		}

		// ユーザーが存在しない場合は新規作成
		if (!existingUser) {
			const { data: newUser, error: insertError } = await supabaseAdmin
				.from("user")
				.insert([
					{
						user_id: data.userId,
						email: data.email,
						name: data.name || data.email.split("@")[0],
						picture_url: data.picture,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
				])
				.select()
				.single();

			if (insertError) {
				console.error("Error creating new user:", insertError);
			} else {
				console.log("Supabase user created successfully");
			}
		}

		console.log("Supabase user setup complete");

		return {
			userId: data.userId,
			email: data.email,
			accessToken: data.accessToken,
			refreshToken: data.refreshToken,
			expiresAt: Date.now() + data.expiresIn * 1000,
			supabaseToken: supabaseToken,
		};
	},
};

export const authenticator = new Authenticator<User>(sessionStorage);

const auth0Strategy = new Auth0Strategy(
	{
		callbackURL: process.env.AUTH0_CALLBACK_URL,
		clientID: process.env.AUTH0_CLIENT_ID,
		clientSecret: process.env.AUTH0_CLIENT_SECRET,
		domain: process.env.AUTH0_DOMAIN,
	},
	async ({ accessToken, refreshToken, extraParams, profile }) => {
		console.log("profile", profile);
		if (!profile.emails || profile.emails.length === 0) {
			throw new Error("Email is required");
		}
		if (!profile.id) {
			throw new Error("User ID is required");
		}
		const user = await UserService.convertToUserObject({
			email: profile.emails[0].value,
			accessToken,
			refreshToken,
			expiresIn: extraParams.expires_in,
			userId: profile.id,
			name: profile.displayName,
			picture: profile.photos?.[0]?.value,
		});

		return user;
	},
);

authenticator.use(auth0Strategy);

// トークン更新用の関数
async function refreshAccessToken(refreshToken: string): Promise<{
	accessToken: string;
	expiresIn: number;
}> {
	const response = await fetch(
		`https://${process.env.AUTH0_DOMAIN}/oauth/token`,
		{
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				grant_type: "refresh_token",
				client_id: process.env.AUTH0_CLIENT_ID ?? "",
				client_secret: process.env.AUTH0_CLIENT_SECRET ?? "",
				refresh_token: refreshToken,
			}),
		},
	);

	const data = await response.json();
	return {
		accessToken: data.access_token,
		expiresIn: data.expires_in,
	};
}

export async function getValidAccessToken(request: Request): Promise<string> {
	const session = await getSession(request.headers.get("Cookie"));
	const user = session.get("user") as User;
	console.log("=============================User in session:", user);

	if (!user) {
		throw redirect("/login");
	}

	// トークンの有効期限チェック（5分の余裕を持たせる）
	const isExpiringSoon = user.expiresAt - Date.now() < 5 * 60 * 1000;

	if (isExpiringSoon && user.refreshToken) {
		const { accessToken, expiresIn } = await refreshAccessToken(
			user.refreshToken,
		);

		// セッションの更新
		const newUser: User = {
			...user,
			accessToken,
			expiresAt: Date.now() + expiresIn * 1000,
		};
		session.set("user", newUser);

		// セッションの保存
		throw redirect(request.url, {
			headers: {
				"Set-Cookie": await commitSession(session),
			},
		});
	}
	console.log("+++++++++++++++++++++++++++++User is authenticated:", user);

	return user.accessToken;
}

// 要保護ルートのためのミドルウェア
export async function requireUser(request: Request) {
	const session = await getSession(request.headers.get("Cookie"));
	const user = session.get("user") as User | undefined;

	if (!user) {
		throw redirect("/login");
	}
	console.log("=== requireUser - Session ===", session);
	console.log("============================Authenticated user:", user);

	return user;
}

// 認証状態のチェック
export async function checkAuthStatus(request: Request) {
	const session = await getSession(request.headers.get("Cookie"));
	const user = session.get("user") as User | undefined;
	return {
		isAuthenticated: !!user,
		user: user || null,
	};
}

export async function createAdminClient() {
	// 新しい secret key を優先、なければ古い service_role を使用
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseKey = process.env.SUPABASE_SECRET_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not defined");
	}

	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}
