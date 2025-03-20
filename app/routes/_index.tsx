import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { authenticator } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export const action = ({ request }: ActionFunctionArgs) => {
	console.log("request", request);
	return authenticator.authenticate("auth0", request);
};

export default function Index() {
	return (
		<div>
			<h1>初期ページ</h1>
		</div>
	);
}
