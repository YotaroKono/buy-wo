import type { WishItem } from "~/utils/types/wishItem";

export function sortWishItems(wishItems: WishItem[]): WishItem[] {
  return wishItems.sort((a, b) => {
    const priorityOrder = { high: 1, middle: 2, low: 3 };
    const priorityA = priorityOrder[a.priority as "high" | "middle" | "low"] || 4;
    const priorityB = priorityOrder[b.priority as "high" | "middle" | "low"] || 4;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // 同じ優先度内では、追加日時（新しい順）
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
