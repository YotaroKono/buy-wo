export type SystemCategory = {
	id: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
};

export type UserCategory = {
	id: string;
	user_id: string;
	system_category_id: string | null;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
};
