import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";

import { AppLayout } from "./components/AppLayout";
import styles from "./tailwind.css?url";
import { checkAuthStatus } from "./utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const authStatus = await checkAuthStatus(request);
	return authStatus;
};

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: styles },
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<ScrollRestoration />
				{children}
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const authData = useLoaderData<typeof loader>();

	return (
		<AppLayout authData={authData}>
			<Outlet />
		</AppLayout>
	);
}
