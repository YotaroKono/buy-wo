import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/models/auth.server";
import { setupUserCategories } from "~/models/category.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireUser(request);

	try {
		// ユーザーのsupabaseTokenが存在することを確認
		if (!user.supabaseToken) {
			throw new Error("認証トークンがありません");
		}

		// 独立したプロセスとしてカテゴリをセットアップ
		await setupUserCategories(user.userId, user.supabaseToken);
		return json({ success: true });
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: "カテゴリのセットアップに失敗しました";

		return json({ error: errorMessage }, { status: 500 });
	}
}

export default function Dashboard() {
	return <div>Dashboard</div>;
}
