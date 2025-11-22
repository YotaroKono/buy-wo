import { v4 as uuidv4 } from "uuid";
import type { WishItem } from "~/utils/types/wishItem";
import { getSignedUrl } from "../utils/supabase/SignedUrlCache.ts";
import { getSupabaseClient } from "./supabase.server";

// user_categoryテーブルからカテゴリ名を取得する関数を追加
export async function getCategoryName(
	categoryId: string | null | undefined,
	supabaseToken: string,
): Promise<string | null> {
	if (!categoryId) {
		return "未分類";
	}

	const supabase = getSupabaseClient(supabaseToken);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	const { data, error } = await supabase
		.from("user_category")
		.select("name")
		.eq("id", categoryId)
		.single();

	if (error) {
		console.error("Error fetching user category:", error);
		return null;
	}

	return data?.name || null;
}

// アイテムの購入状態をトグルする関数
export async function toggleItemPurchaseStatus(
	itemId: string,
	userId: string,
	supabaseToken: string,
): Promise<{ success: boolean; status: "unpurchased" | "purchased" }> {
	const supabase = getSupabaseClient(supabaseToken);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	// まず現在のステータスを取得
	const { data: currentItem, error: fetchError } = await supabase
		.from("wish_item")
		.select("status")
		.eq("id", itemId)
		.eq("user_id", userId)
		.single();

	if (fetchError) {
		console.error("Error fetching wish item:", fetchError);
		throw new Error("アイテムの取得に失敗しました");
	}

	if (!currentItem) {
		throw new Error("アイテムが見つからないか、更新権限がありません");
	}

	// 状態を反転
	const newStatus =
		currentItem.status === "purchased" ? "unpurchased" : "purchased";
	const now = new Date().toISOString();

	// 購入日を設定または削除
	const purchaseDate = newStatus === "purchased" ? now : null;

	// 更新
	const { error: updateError } = await supabase
		.from("wish_item")
		.update({
			status: newStatus,
			purchase_date: purchaseDate,
			updated_at: now,
		})
		.eq("id", itemId)
		.eq("user_id", userId);

	if (updateError) {
		console.error("Error updating wish item status:", updateError);
		throw new Error("アイテムの状態更新に失敗しました");
	}

	return {
		success: true,
		status: newStatus,
	};
}

export async function getWishItems(
	userId: string,
	supabaseToken: string,
	status?: "unpurchased" | "purchased",
	priority?: "high" | "middle" | "low",
	sortBy?: string,
	sortOrder?: "asc" | "desc",
): Promise<WishItem[]> {
	const supabase = getSupabaseClient(supabaseToken);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	let query = supabase.from("wish_item").select("*").eq("user_id", userId);

	if (status) {
		query = query.eq("status", status);
	}

	if (priority) {
		query = query.eq("priority", priority);
	}

	const { data, error } = await query;

	if (error) {
		console.error("Error fetching wish items:", error);
		throw new Error("Wish itemsの取得に失敗しました");
	}

	const items = data as WishItem[];

	// 画像パスがあるアイテムに対してキャッシュ対応の署名付きURLを生成
	const itemsWithUrls = await Promise.all(
		items.map(async (item) => {
			if (item.image_path) {
				const signedUrl = await getSignedUrl(supabase, item.image_path);

				if (signedUrl) {
					return {
						...item,
						image_path: signedUrl,
					};
				}
			}
			return item;
		}),
	);

	return itemsWithUrls;
}

export async function deleteWishItem(
	itemId: string,
	userId: string,
	supabaseToken: string,
): Promise<boolean> {
	const supabase = getSupabaseClient(supabaseToken);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	// 1. 削除対象のアイテム情報を取得して画像パスを確認
	const { data: itemToDelete, error: fetchError } = await supabase
		.from("wish_item")
		.select("image_path")
		.eq("id", itemId)
		.eq("user_id", userId)
		.single();

	if (fetchError && fetchError.code !== "PGRST116") {
		console.error("Error fetching wish item for deletion:", fetchError);
		throw new Error("削除対象のアイテム取得に失敗しました");
	}

	// 2. ストレージから画像を削除 (画像パスが存在する場合)
	if (itemToDelete?.image_path) {
		const { error: storageError } = await supabase.storage
			.from("wish-item-images")
			.remove([itemToDelete.image_path]);

		if (storageError) {
			// ストレージからの画像削除に失敗しても、DBからのアイテム削除は試みる
			console.error("Error deleting image from storage:", storageError);
		}
	}

	// 3. データベースからアイテムを削除
	const { error: deleteError } = await supabase
		.from("wish_item")
		.delete()
		.eq("id", itemId)
		.eq("user_id", userId);

	if (deleteError) {
		console.error("Error deleting wish item from database:", deleteError);
		throw new Error("Wish itemの削除に失敗しました");
	}

	return true;
}
export async function createWishItem(
	userId: string,
	supabaseToken: string,
	wishItem: Omit<WishItem, "id" | "user_id" | "created_at" | "updated_at"> & {
		image?: File | null;
	},
): Promise<WishItem> {
	const supabase = getSupabaseClient(supabaseToken);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	// サーバーサイドでIDを生成
	const newItemId = uuidv4();
	let imagePath: string | null = wishItem.image_path || null;

	if (supabaseToken) {
		try {
			const payload = JSON.parse(atob(supabaseToken.split(".")[1]));
			console.log("===== JWT PAYLOAD =====");
			console.log(JSON.stringify(payload, null, 2));
			console.log("role:", payload.role);
			console.log("userId:", payload.userId);
			console.log("=======================");
		} catch (e) {
			console.error("Failed to decode JWT:", e);
		}
	}

	if (wishItem.image) {
		const file = wishItem.image;
		if (!(file instanceof File)) {
			throw new Error("image must be a File");
		}
		const safeUserId = userId.replace(/[|]/g, "-");
		console.log(safeUserId);

		// 新しく生成したIDをファイル名に使用
		const fileName = `${safeUserId}/${newItemId}/${Date.now()}`;

		const { data: uploadData, error: uploadError } = await supabase.storage
			.from("wish-item-images")
			.upload(fileName, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (uploadError) {
			console.error("Error uploading image:", uploadError);
			throw new Error("画像のアップロードに失敗しました");
		}

		// パスのみをDBに保存
		imagePath = uploadData.path;
	}

	// 生成したIDを使用してDBに挿入
	const { image, ...dbWishItem } = wishItem;
	const { data, error } = await supabase
		.from("wish_item")
		.insert({
			id: newItemId,
			...dbWishItem,
			image_path: imagePath, // パスのみを保存
			user_id: userId,
		})
		.select("*")
		.single();

	if (error) {
		console.error("Error creating wish item:", error);
		throw new Error("Wish itemの作成に失敗しました");
	}

	if (!data) {
		throw new Error("Wish itemの作成に失敗しました");
	}

	// 新しい画像がある場合は、署名付きURLを生成してキャッシュする
	if (data.image_path) {
		await getSignedUrl(supabase, data.image_path);
	}

	return data as WishItem;
}

// アイテム表示時に署名付きURLを生成するヘルパー関数（キャッシュ対応）
export async function getWishItemWithImageUrl(
	itemId: string,
	supabaseToken: string,
): Promise<WishItem> {
	const supabase = getSupabaseClient(supabaseToken);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	const { data, error } = await supabase
		.from("wish_item")
		.select("*")
		.eq("id", itemId)
		.single();

	if (error || !data) {
		console.error("Error fetching wish item:", error);
		throw new Error("Wish itemの取得に失敗しました");
	}

	const item = data as WishItem;

	// 画像パスがある場合、キャッシュ対応の署名付きURLを生成
	if (item.image_path) {
		const signedUrl = await getSignedUrl(supabase, item.image_path);

		if (signedUrl) {
			item.image_path = signedUrl;
		}
	}

	return item;
}

// 複数のアイテムを取得し、画像URLを生成するヘルパー関数（キャッシュ対応）
export async function getWishItemsWithImageUrls(
	userId: string,
	supabaseToken: string,
	status?: "unpurchased" | "purchased",
	priority?: "high" | "middle" | "low",
	sortBy?: string,
	sortOrder?: "asc" | "desc",
): Promise<WishItem[]> {
	const supabase = getSupabaseClient(supabaseToken);
	if (!supabase) {
		throw new Error("Supabase clientの生成に失敗しました");
	}

	// 基本的なクエリ
	let query = supabase.from("wish_item").select("*").eq("user_id", userId);

	if (status) {
		query = query.eq("status", status);
	}

	if (priority) {
		query = query.eq("priority", priority);
	}

	if (sortBy) {
		query = query.order(sortBy, { ascending: sortOrder === "asc" });
	}

	const { data, error } = await query;

	if (error) {
		console.error("Error fetching wish items:", error);
		throw new Error("Wish itemsの取得に失敗しました");
	}

	const items = data as WishItem[];

	// 画像パスがあるアイテムに対してキャッシュ対応の署名付きURLを生成
	const itemsWithUrls = await Promise.all(
		items.map(async (item) => {
			if (item.image_path) {
				const signedUrl = await getSignedUrl(supabase, item.image_path);

				if (signedUrl) {
					return {
						...item,
						image_path: signedUrl,
					};
				}
			}
			return item;
		}),
	);

	return itemsWithUrls;
}
