import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import Modal from "~/components/ErrorModal";
import { checkAuthStatus } from "~/models/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { isAuthenticated } = await checkAuthStatus(request);
  
  // 既に認証済みの場合はダッシュボードへリダイレクト
  if (isAuthenticated) {
    return redirect("/dashboard");
  }
  
  return json({});
};

export default function Login() {
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">ログイン・会員登録</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* 認証APIルートを呼び出す */}
        <Form action="/api/login" method="post">
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Auth0でログイン / 会員登録
          </button>
        </Form>
      </div>
      
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