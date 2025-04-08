import { getSupabaseClient } from "./supabase.server";

export interface WishItem {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  product_url: string | null;
  image_path: string | null;
  price: number | null;
  currency: string | null;
  priority: "high" | "middle" | "low";
  status: "unpurchased" | "purchased";
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_location: string | null;
  created_at: string;
  updated_at: string;
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
