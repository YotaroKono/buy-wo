import { getSupabaseClient } from "./supabase.server";

export interface WishItem {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  product_url: string | null;
  image_path: string | null;
  price: number | null;
  currency: 'JPY' | 'USD';
  priority: "high" | "middle" | "low";
  status: "unpurchased" | "purchased";
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_location: string | null;
  created_at: string;
  updated_at: string;
}

// Helper function to format price based on currency
export function formatPrice(price: number | null, currency: string | null | undefined = 'JPY'): string {
  if (!price) return '';

  // Use default currency if null or undefined
  const currencyCode = currency || 'JPY';

  // Currency formatting options by currency code
  const formatOptions: Record<string, { locale: string, options: Intl.NumberFormatOptions }> = {
    'JPY': {
      locale: 'ja-JP',
      options: {
        style: 'currency',
        currency: 'JPY',
        currencyDisplay: 'symbol',
      },
    },
    'USD': {
      locale: 'en-US',
      options: {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol',
      },
    },
  };

  // Use configured format or fallback to default
  const format = formatOptions[currencyCode] || {
    locale: 'ja-JP',
    options: { style: 'currency', currency: currencyCode },
  };

  return new Intl.NumberFormat(format.locale, format.options).format(price);
}

// Get priority display class for UI
export function getPriorityClass(priority: string | null): string {
  switch (priority) {
    case 'high':
      return 'badge-error';
    case 'middle':
      return 'badge-warning';
    case 'low':
      return 'badge-info';
    default:
      return 'badge-ghost';
  }
}

// Get priority display text in Japanese
export function getPriorityLabel(priority: string | null): string {
  switch (priority) {
    case 'high':
      return '高';
    case 'middle':
      return '中';
    case 'low':
      return '低';
    default:
      return '未設定';
  }
}

export async function getWishItems(
  userId: string,
  supabaseToken: string,
  status?: "unpurchased" | "purchased",
  priority?: "high" | "middle" | "low",
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): Promise<WishItem[]> {
  const supabase = getSupabaseClient(supabaseToken);
  if (!supabase) {
    throw new Error("Supabase clientの生成に失敗しました");
  }

  let query = supabase
    .from("wish_item")
    .select("*")
    .eq("user_id", userId);

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

  return data as WishItem[];
}

export async function createWishItem(
  userId: string,
  supabaseToken: string,
  wishItem: Omit<WishItem, "id" | "user_id" | "created_at" | "updated_at">
): Promise<WishItem> {
  const supabase = getSupabaseClient(supabaseToken);
  if (!supabase) {
    throw new Error("Supabase clientの生成に失敗しました");
  }

  const { data, error } = await supabase
    .from("wish_item")
    .insert({
      ...wishItem,
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

  return data as WishItem;
}
