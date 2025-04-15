import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import type { User } from "~/utils/types/user";

type HeaderProps = {
	isAuthenticated: boolean;
	user: User | null;
};

export const Header = ({ isAuthenticated, user }: HeaderProps) => {
	return (
		<header className="bg-gray-800 text-white p-4">
		<div className="container mx-auto flex justify-between items-center">
			{/* ロゴ部分 */}
			<div className="flex items-center">
			<img src="/public/icon.svg" alt="サイトロゴ" className="w-full" />
			</div>
			{/* 認証ボタン部分（既存のコード） */}
			<div>
			{isAuthenticated ? (
				<div>会員済み</div>
			) : (
				<Form action="/login" method="post">
				<button type="submit" className="btn btn-accent">
					ログイン・会員登録
				</button>
				</Form>
			)}
			</div>
		</div>
		</header>
	);
};
