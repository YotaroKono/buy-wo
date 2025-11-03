import { Form, Link } from "@remix-run/react";
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
					<Link to="/items">
						<img src="/icon.svg" alt="サイトロゴ" className="w-full" />
					</Link>
				</div>
				{/* 認証ボタン部分（既存のコード） */}
				<div>
					{isAuthenticated ? (
						<div className="flex items-center gap-4">
							<span>会員情報</span>
							<Form action="/logout" method="post">
								<button type="submit" className="btn btn-ghost">
									ログアウト
								</button>
							</Form>
						</div>
					) : (
						<Form action="/api/login" method="post">
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
