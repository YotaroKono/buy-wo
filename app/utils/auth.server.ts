import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import type { User } from "./types/user";

// Authenticatorのインスタンスを作成し、ストラテジーが返す型と
// セッションに保存される型のジェネリックを渡します

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: ["SeCreT"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

const UserService = {
  async findOrCreate(data: {
    email: string;
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }): Promise<User> {
    return {
      email: data.email,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresIn * 1000,
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
    const user = await UserService.findOrCreate({
      email: profile.emails[0].value,
      accessToken,
      refreshToken,
      expiresIn: extraParams.expires_in,
    });

    return user;
  }
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
    }
  );

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

// TODO: 要見直し
// アクセストークンの取得と必要に応じた更新を行うユーティリティ
export async function getValidAccessToken(request: Request): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user") as User;
  console.log("@@@@@@@@@@@@@@@@@@@@@@@", user);

  if (!user) {
    throw redirect("/login");
  }

  // トークンの有効期限チェック（5分の余裕を持たせる）
  const isExpiringSoon = user.expiresAt - Date.now() < 5 * 60 * 1000;

  if (isExpiringSoon && user.refreshToken) {
    const { accessToken, expiresIn } = await refreshAccessToken(
      user.refreshToken
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

  return user.accessToken;
}

// 要保護ルートのためのミドルウェア
export async function requireUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user") as User | undefined;

  if (!user) {
    throw redirect("/login");
  }

  return user;
}

export async function checkAuthStatus(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user") as User | undefined;

  return {
    isAuthenticated: !!user,
    user: user || null,
  };
}
