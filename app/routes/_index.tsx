import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { redirect, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import Modal from "~/components/ErrorModal";
import { authenticator, requireUser } from "~/models/auth.server";

export const meta: MetaFunction = () => {
	return [{ title: "buy-wo" }];
};

// TODO: 無限にリダイレクトが起きているので修正する
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireUser(request);
	if (user) {
		return null;
	}
	redirect("/dashboard");
};

export const action = ({ request }: ActionFunctionArgs) => {
	console.log("request", request);
	return authenticator.authenticate("auth0", request);
};

export default function Index() {
	const [searchParams] = useSearchParams();
	const [showLoginFailedDialog, setShowLoginFailedDialog] = useState(false);

	useEffect(() => {
		if (searchParams.get("loginFailed") === "true") {
			setShowLoginFailedDialog(true);
		}
	}, [searchParams]);

	const closeDialog = () => {
		setShowLoginFailedDialog(false);
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.delete("loginFailed");
		window.history.replaceState({}, "", newUrl.toString());
	};

	return (
		<div>
			<h1>初期ページ</h1>
			<Modal
				isOpen={showLoginFailedDialog}
				onClose={closeDialog}
				title="ログイン失敗"
			>
				<p>
					ログインに失敗しました。しばらくしてから、もう一度お試しください。
				</p>
			</Modal>
		</div>
	);
}
