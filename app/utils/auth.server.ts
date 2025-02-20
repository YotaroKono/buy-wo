import { createCookieSessionStorage } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";

// Authenticatorのインスタンスを作成し、ストラテジーが返す型と
// セッションに保存される型のジェネリックを渡します

type User = {
  email: string;
};

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: ["SeCreT"], // replace this with an actual secret (よくわからん。多分なんでもいい)
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

const UserService = {
  async findOrCreate(data: { email: string }): Promise<User> {
    // ここでユーザーを検索または作成するロジックを実装
    // 例: データベースとの連携など

    return {
      email: data.email,
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
    return UserService.findOrCreate({ email: profile.emails[0].value });
  }
);

authenticator.use(auth0Strategy);
