import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import type { User } from "~/utils/types/user";

type HeaderProps = {
	isAuthenticated: boolean;
	user: User | null;
};

export const Header = ({ isAuthenticated, user }: HeaderProps) => {
	return (
		<header className="bg-gray-800 text-white p-4 text-center">
			<div className="flex justify-end">
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
