import type { SystemCategory, UserCategory } from "~/utils/types/category";
import { getSupabaseClient } from "./supabase.server";

/**
 * ユーザーのカテゴリを作成する
 * 認証プロセスから分離して独立して呼び出される
 */
export async function createUserCategories(
	userId: string,
	token: string,
): Promise<UserCategory[]> {
	const supabase = getSupabaseClient(token);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	// システムカテゴリを取得
	const { data: systemCategories, error: systemCategoriesError } =
		await supabase.from("system_category").select("*");

	if (systemCategoriesError) {
		console.error("Error fetching system categories:", systemCategoriesError);
		throw systemCategoriesError;
	}

	if (!systemCategories || systemCategories.length === 0) {
		return [];
	}

	// システムカテゴリからユーザーカテゴリを作成
	const userCategories = systemCategories.map(
		(systemCategory: SystemCategory) => ({
			user_id: userId,
			system_category_id: systemCategory.id,
			name: systemCategory.name,
			description: systemCategory.description,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		}),
	);

	// ユーザーカテゴリを挿入
	const { data: insertedCategories, error: userCategoryError } = await supabase
		.from("user_category")
		.insert(userCategories)
		.select();

	if (userCategoryError) {
		console.error("Error creating user categories:", userCategoryError);
		throw userCategoryError;
	}

	console.log(`${userCategories.length} categories created for user ${userId}`);
	return insertedCategories as UserCategory[];
}

/**
 * 既存のユーザーカテゴリを確認し、不足しているカテゴリのみを追加
 */
export async function ensureUserCategories(
	userId: string,
	token: string,
): Promise<UserCategory[]> {
	const supabase = getSupabaseClient(token);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	// システムカテゴリを取得
	const { data: systemCategories, error: systemCategoriesError } =
		await supabase.from("system_category").select("*");

	if (systemCategoriesError) {
		console.error("Error fetching system categories:", systemCategoriesError);
		throw systemCategoriesError;
	}

	// 現在のユーザーカテゴリを取得
	const { data: existingUserCategories, error: userCategoriesError } =
		await supabase
			.from("user_category")
			.select("name, system_category_id")
			.eq("user_id", userId);

	if (userCategoriesError) {
		console.error("Error fetching user categories:", userCategoriesError);
		throw userCategoriesError;
	}

	// 既存のユーザーカテゴリの名前セットを作成
	const existingCategoryNames = new Set(
		existingUserCategories?.map((cat: Partial<UserCategory>) => cat.name) || [],
	);

	// 不足しているカテゴリを特定
	const missingCategories =
		systemCategories?.filter(
			(systemCategory: SystemCategory) =>
				!existingCategoryNames.has(systemCategory.name),
		) || [];

	// 不足しているカテゴリがない場合は空配列を返す
	if (missingCategories.length === 0) {
		console.log(`All system categories already exist for user ${userId}`);
		return [];
	}

	// 不足しているカテゴリからユーザーカテゴリを作成
	const userCategories = missingCategories.map(
		(systemCategory: SystemCategory) => ({
			user_id: userId,
			system_category_id: systemCategory.id,
			name: systemCategory.name,
			description: systemCategory.description,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		}),
	);

	// ユーザーカテゴリを挿入
	const { data: insertedCategories, error: userCategoryError } = await supabase
		.from("user_category")
		.insert(userCategories)
		.select();

	if (userCategoryError) {
		console.error("Error creating missing user categories:", userCategoryError);
		throw userCategoryError;
	}

	console.log(
		`${userCategories.length} missing categories added for user ${userId}`,
	);
	return insertedCategories as UserCategory[];
}

/**
 * ユーザーのカテゴリをセットアップするためのラッパー関数
 * Remix loaderやactionから呼び出される
 */
export async function setupUserCategories(
	userId: string,
	token: string,
): Promise<UserCategory[]> {
	try {
		// ユーザーが存在するか確認
		const supabase = getSupabaseClient(token);
		if (!supabase) {
			throw new Error("Supabase clientの生成に失敗しました");
		}

		const { data: user, error } = await supabase
			.from("user")
			.select("user_id")
			.eq("user_id", userId)
			.single();

		if (error) {
			console.error("Error fetching user:", error);
			throw error;
		}

		if (user) {
			// ユーザーが存在する場合、カテゴリを同期
			return await ensureUserCategories(userId, token);
		}
		console.error("User not found for category setup");
		throw new Error("ユーザーが見つかりませんでした");
	} catch (error) {
		console.error("Error setting up categories:", error);
		throw error;
	}
}

/**
 * ユーザーのカテゴリを取得する
 */
export async function getUserCategories(
	userId: string,
	token: string,
): Promise<UserCategory[]> {
	const supabase = getSupabaseClient(token);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	const { data, error } = await supabase
		.from("user_category")
		.select("*")
		.eq("user_id", userId);

	if (error) {
		console.error("Error fetching user categories:", error);
		throw error;
	}

	return data as UserCategory[];
}
