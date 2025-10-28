import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticator, commitSession, getSession } from "~/models/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	console.log("===================Auth0 callback START");

	// セッションを取得
	const session = await getSession(request.headers.get("Cookie"));

	// Auth0認証を実行（successRedirect/failureRedirectを使わない）
	const user = await authenticator.authenticate("auth0", request, {
		throwOnError: true, // エラー時に例外をスロー
	});

	console.log("===================Auth0 callback - User created:", user);

	// セッションにユーザーを保存
	session.set(authenticator.sessionKey, user);

	console.log("===================Auth0 callback - Session saved");

	// セッションをコミットしてリダイレクト
	return redirect("/items", {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
};
