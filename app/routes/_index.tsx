import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import Modal from "~/components/ErrorModal";
import { authenticator } from "~/models/auth.server"; // Assuming Modal is in this path

export const meta: MetaFunction = () => {
	return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
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
				<p>ログインに失敗しました。しばらくしてから、もう一度お試しください。</p>
			</Modal>
		</div>
	);
}