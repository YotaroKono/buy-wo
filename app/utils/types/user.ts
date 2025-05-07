export type User = {
	email: string;
	accessToken: string;
	refreshToken?: string;
	expiresAt: number;
	supabaseToken?: string;
	userId: string;
	name?: string;
	picture_url?: string;
};
