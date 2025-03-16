export type User = {
	email: string;
	accessToken: string;
	refreshToken?: string;
	expiresAt: number;
};
