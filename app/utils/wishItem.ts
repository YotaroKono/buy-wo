import type { WishItem } from "./types/wishItem";

export const formatPrice = (price: number | undefined, currency: string | undefined): string => {
  if (!price || !currency) return "";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: currency,
  }).format(price);
};

export const getPriorityClass = (priority: WishItem["priority"]): string => {
  switch (priority) {
    case "high":
      return "badge-error";
    case "medium":
      return "badge-warning";
    case "low":
      return "badge-info";
    default:
      return "";
  }
};

export const getPriorityLabel = (priority: WishItem["priority"]): string => {
  switch (priority) {
    case "high":
      return "高";
    case "medium":
      return "中";
    case "low":
      return "低";
    default:
      return "";
  }
};
