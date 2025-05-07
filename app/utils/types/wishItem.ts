export type WishItem = {
	id: string;
	user_id: string;
	name: string;
	description: string | null;
	product_url: string | null;
	image_path: string | null;
	price: number | null;
	currency: "JPY" | "USD";
	priority: "high" | "middle" | "low";
	status: "unpurchased" | "purchased"; // 'purchased' または 'unpurchased'
	purchase_date: string | null; // 追加
	purchase_price: number | null; // 追加
	purchase_location: string | null; // 追加
	created_at: string;
	updated_at: string;
	user_category_id: string | null;
	categoryName: string | null;
	categoryId: string | null;
};
