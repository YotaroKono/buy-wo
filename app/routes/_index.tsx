import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { authenticator } from "~/utils/auth.server";

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
			{showLoginFailedDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">ログイン失敗</h2>
            <p className="mb-4">ログインに失敗しました。もう一度お試しください。</p>
            <div className="flex justify-end">
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
		</div>
	);
}
