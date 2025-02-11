import { Footer } from "./Footer";
import { Header } from "./Header";

type LayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <body>{children}</body>
      <Footer />
    </>
  );
}
