import type { LoaderFunctionArgs } from "@remix-run/node";
import {
	Form,
	Link,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from "@remix-run/react";
import WishItemList from "~/components/feature/wishItem/wishItemList";
import { createSupabaseToken, requireUser } from "~/models/auth.server";
import {
	getUserCategories,
	setupUserCategories,
} from "~/models/category.server";
import { getCategoryName, getWishItems } from "~/models/wishItem.server";
import type { UserCategory } from "~/utils/types/category";
import type { WishItem } from "~/utils/types/wishItem";
import { sortWishItems } from "~/utils/wishItemSorter";

// ソート順の型定義
type SortOrder = "newest" | "oldest" | "price_asc" | "price_desc" | "price_asc";

// ローダーとアクションの返り値の型を定義
type LoaderData =
	| {
			success: true;
			wishItems: WishItem[];
			error?: never;
			sortOrder: SortOrder;
			supabaseToken: string;
			categoryNameMapping: { [key: string]: string | null };
			categories: UserCategory[];
			categoryId: string | null;
	  }
	| {
			success: false;
			error: string;
			wishItems?: never;
			categoryNameMapping?: { [key: string]: string | null };
			categoryId?: never;
	  };

// ユーザーのsupabaseTokenが存在することを確認

export const loader = async ({
	request,
}: LoaderFunctionArgs): Promise<LoaderData> => {
	try {
		const user = await requireUser(request);
		const supabaseToken = createSupabaseToken(user.userId);
		console.log("=======================Login loader - user:", user);

		if (!user.supabaseToken) {
			throw new Error("認証トークンがありません");
		}
		// ユーザーのカテゴリをセットアップ
		await setupUserCategories(user.userId, user.supabaseToken);

		// クエリパラメータからソート順を取得
		const url = new URL(request.url);
		const sortBy = url.searchParams.get("sort") || "createdAt_desc"; // デフォルトは新しい順
		const categoryId = url.searchParams.get("category") || null;

		let wishItems = (await getWishItems(
			user.userId,
			supabaseToken,
		)) as WishItem[];

		if (categoryId) {
			if (categoryId === "uncategorized") {
				// 未分類のアイテムをフィルタリング
				wishItems = wishItems.filter((item) => item.user_category_id === null);
			} else {
				// 特定のカテゴリーのアイテムをフィルタリング
				wishItems = wishItems.filter(
					(item) => item.user_category_id === categoryId,
				);
			}
		}

		// カテゴリー名を取得
		const categoryNames = await Promise.all(
			wishItems.map(async (item) => {
				let categoryName: string | null;
				if (item.user_category_id === null) {
					categoryName = "未分類";
				} else {
					categoryName = await getCategoryName(
						item.user_category_id,
						supabaseToken,
					);
				}
				return { itemId: item.id, categoryName };
			}),
		);

		const categoryNameMapping: { [key: string]: string | null } =
			categoryNames.reduce(
				(acc: { [key: string]: string | null }, { itemId, categoryName }) => {
					acc[itemId] = categoryName;
					return acc;
				},
				{},
			);

		// ソート
		wishItems = sortWishItems(wishItems, sortBy);

		return {
			success: true,
			wishItems: wishItems,
			sortOrder: sortBy as SortOrder,
			supabaseToken: supabaseToken,
			categoryNameMapping: categoryNameMapping,
			categories: await getUserCategories(user.userId, supabaseToken),
			categoryId,
		};
	} catch (error) {
		console.error(error);
		return { success: false, error: "Failed to fetch wish items" };
	}
};

export default function WishItemsIndex() {
	const data = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const handleSortChange = (sortBy: string) => {
		const params = new URLSearchParams(searchParams);
		params.set("sort", sortBy);
		navigate(`/items?${params.toString()}`);
	};

	// 優先度に応じた色クラスを返す関数
	const getPriorityClass = (priority: string) => {
		switch (priority) {
			case "high":
				return "badge-error";
			case "middle":
				return "badge-warning";
			case "low":
				return "badge-info";
			default:
				return "badge-ghost";
		}
	};

	// 価格表示のフォーマット
	const formatPrice = (
		price: number | null,
		currency: string | null | undefined = "JPY",
	) => {
		if (!price) return "";

		// nullやundefinedの場合はデフォルト値を使用
		const currencyCode = currency || "JPY";

		// 通貨ごとにロケールとフォーマットオプションを設定
		const formatOptions: Record<
			string,
			{ locale: string; options: Intl.NumberFormatOptions }
		> = {
			JPY: {
				locale: "ja-JP",
				options: {
					style: "currency",
					currency: "JPY",
					currencyDisplay: "symbol",
				},
			},
			USD: {
				locale: "en-US",
				options: {
					style: "currency",
					currency: "USD",
					currencyDisplay: "symbol",
				},
			},
		};

		// 設定された通貨のフォーマットがあれば使用、なければデフォルト設定
		const format = formatOptions[currencyCode] || {
			locale: "ja-JP",
			options: { style: "currency", currency: currencyCode },
		};

		return new Intl.NumberFormat(format.locale, format.options).format(price);
	};

	// データの状態に基づいて表示を切り替え
	if (!data.success) {
		return (
			<>
				{/* biome-ignore lint/a11y/useKeyWithClickEvents:*/}
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={() => navigate("/")}
					role="presentation"
				/>
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div className="card w-96 bg-base-100 card-md shadow-xl">
						<div className="card-body">
							<h2 className="card-title justify-center">
								エラーが発生しました
							</h2>
							<p>{data.error}</p>
							<div className="justify-end card-actions">
								<Link to="/" className="btn btn-primary">
									ホームに戻る
								</Link>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}
	// 成功時の表示
	const supabaseToken = data.supabaseToken;
	const categoryNameMapping = data.categoryNameMapping;

	console.log("categoryNameMapping", categoryNameMapping);
	const categoryId = searchParams.get("category") || null;

	const handleCategoryFilterChange = (categoryId: string | null) => {
		const params = new URLSearchParams(searchParams);
		if (categoryId) {
			params.set("category", categoryId);
		} else {
			params.delete("category");
		}
		setSearchParams(params);
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<WishItemList
				wishItems={data.wishItems}
				sortOrder={data.sortOrder}
				onSortChange={handleSortChange}
				supabaseToken={supabaseToken}
				categoryNameMapping={categoryNameMapping}
				categories={data.categories}
				onCategoryFilterChange={handleCategoryFilterChange}
			/>
		</div>
	);
}
