// app/utils/client-only.tsx
import { type ReactNode, useEffect, useState } from "react";

interface ClientOnlyProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return isClient ? <>{children}</> : <>{fallback}</>;
}
