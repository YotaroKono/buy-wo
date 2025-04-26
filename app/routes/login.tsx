import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import Modal from "~/components/ErrorModal";
import { checkAuthStatus } from "~/models/auth.server";
import AnimatedCard from "~/components/AnimatedCard";

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
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 z-10">
      <AnimatedCard />
      <Modal
        isOpen={showLoginFailedDialog}
        onClose={closeDialog}
        title="ログイン失敗"
      >
        <p>ログインに失敗しました。しばらくしてから、もう一度お試しください。</p>
      </Modal>
      </div>
    </div>
  );
}
