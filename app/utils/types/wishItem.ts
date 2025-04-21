export interface WishItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  product_url?: string;
  image_path?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "purchased" | "cancelled";
  created_at: string;
  updated_at: string;
  user_id: string;
}
