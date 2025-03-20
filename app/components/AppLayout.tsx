import { Footer } from "./Footer";
import { Header } from "./Header";

type LayoutProps = {
	children: React.ReactNode;
	authData: { isAuthenticated: boolean; user: any };
};

export function AppLayout({ children, authData }: LayoutProps) {
	return (
		<>
			<Header isAuthenticated={authData.isAuthenticated} user={authData.user} />
			<body>{children}</body>
			<Footer />
		</>
	);
}
