import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
	interface Future {
		v3_singleFetch: true;
	}
}

export default defineConfig({
	plugins: [
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				v3_singleFetch: true,
				v3_lazyRouteDiscovery: true,
			},
			// .server.tsファイルをクライアントバンドルから除外
			serverModuleFormat: "esm",
		}),
		tsconfigPaths(),
		nodePolyfills({
			include: ['crypto', 'buffer', 'process', 'stream', 'util'],
			globals: { 
			  Buffer: true,
			  global: true,
			  process: true 
			},
		  }),
		],
	//.server.tsファイルを明示的に外部化
	build: {
			rollupOptions: {
			  external: [/\.server\.(js|jsx|ts|tsx)$/],
			},
		  },
});
