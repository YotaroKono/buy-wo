// app/utils/env.server.ts
import "dotenv/config";
import * as z from "zod";

const envSchema = z.object({
	SESSION_SECRET: z.string().min(1),
	AUTH0_CALLBACK_URL: z.string().min(1),
	AUTH0_CLIENT_ID: z.string().min(1),
	AUTH0_CLIENT_SECRET: z.string().min(1),
	AUTH0_DOMAIN: z.string().min(1),
	AUTH0_LOGOUT_URL: z.string().min(1),
	AUTH0_RETURN_TO_URL: z.string().min(1),
	SUPABASE_JWT_SECRET: z.string().min(1),
	SUPABASE_URL: z.string().min(1),
	SUPABASE_ANON_KEY: z.string().min(1),
});

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envSchema> {}
	}
}

export function getEnv() {
	const env = envSchema.safeParse(process.env);

	if (!env.success) {
		throw new Error("無効な環境変数があります");
	}

	return env.data;
}

export const env = getEnv();
