import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";

// Authenticatorのインスタンスを作成し、ストラテジーが返す型と
// セッションに保存される型のジェネリックを渡します
export const authenticator = new Authenticator<User>();

const auth0Strategy = new Auth0Strategy(
	{
		callbackURL: "https://example.com/auth/auth0/callback",
		clientID: "YOUR_AUTH0_CLIENT_ID",
		clientSecret: "YOUR_AUTH0_CLIENT_SECRET",
		domain: "YOUR_TENANT.us.auth0.com",
	},
	async ({ accessToken, refreshToken, extraParams, profile }) => {
		// トークンとプロファイルを使用して、DBまたはAPIからユーザーデータを取得
		return User.findOrCreate({ email: profile.emails[0].value });
	},
);

authenticator.use(auth0Strategy);
