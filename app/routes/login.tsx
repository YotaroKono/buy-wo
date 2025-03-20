import { Form } from "@remix-run/react";

import { type ActionFunctionArgs, redirect } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server";

// export const loader = () => redirect("/hoge");

export const action = ({ request }: ActionFunctionArgs) => {
	console.log("request", request);
	return authenticator.authenticate("auth0", request);
};

// TODO: ログイン機能はヘッダーで実装する・ログイン後のリダイレクトはホーム画面にしてモーダルを表示する
export default function Login() {
	return (
		<Form action="/login" method="post">
			<button type="submit">Login with Auth0</button>
		</Form>
	);
}
