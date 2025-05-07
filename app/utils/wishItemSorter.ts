import type { WishItem } from "~/utils/types/wishItem";

export function sortWishItems(
	wishItems: WishItem[],
	sortBy: string,
): WishItem[] {
	const sortedItems = [...wishItems];

	if (sortBy === "priority") {
		sortedItems.sort(sortByPriority);
	} else if (sortBy === "createdAt_asc") {
		// ← ここに else を追加
		sortedItems.sort(
			(a, b) =>
				new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
		);
	} else if (sortBy === "createdAt_desc") {
		sortedItems.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		);
	} else if (sortBy === "price_asc") {
		sortedItems.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
	} else if (sortBy === "price_desc") {
		sortedItems.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
	} else {
		sortedItems.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		);
	}

	return sortedItems;
}

export function sortByPriority(a: WishItem, b: WishItem): number {
	const priorityOrder = { high: 1, middle: 2, low: 3 };
	const priorityA = priorityOrder[a.priority as "high" | "middle" | "low"] || 4;
	const priorityB = priorityOrder[b.priority as "high" | "middle" | "low"] || 4;

	if (priorityA !== priorityB) {
		return priorityA - priorityB;
	}

	// 優先度が同じ場合は作成日時の新しい順
	return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}
