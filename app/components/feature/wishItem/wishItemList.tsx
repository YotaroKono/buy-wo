import { Link } from "@remix-run/react";
import { useState } from "react";
import type { UserCategory } from "~/utils/types/category";
import type { WishItem } from "~/utils/types/wishItem";
import WishItemCard from "./wishItemCard";

interface WishItemListProps {
	wishItems: WishItem[];
	title?: string;
	onSortChange?: (sortBy: string) => void;
	sortOrder?: "newest" | "oldest" | "price_asc" | "price_desc";
	supabaseToken: string;
	categoryNameMapping?: { [key: string]: string | null };
	categories: UserCategory[];
	onCategoryFilterChange?: (categoryId: string | null) => void;
}

export default function WishItemList({
	wishItems,
	title = "買いたいものリスト",
	onSortChange,
	sortOrder,
	supabaseToken,
	categoryNameMapping,
	onCategoryFilterChange,
	categories,
}: WishItemListProps) {
	const handleSortChange = (value: string) => {
		if (onSortChange) {
			onSortChange(value);
		}
	};

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-y-4 mb-6">
				<h1 className="w-full text-2xl font-bold md:w-auto">{title}</h1>
				<div className="flex w-full items-center justify-end space-x-2 md:w-auto">
					<select
						onChange={(e) => {
							if (onCategoryFilterChange) {
								onCategoryFilterChange(
									e.target.value === "" ? null : e.target.value,
								);
							}
						}}
						className="select select-bordered select-sm w-full max-w-xs"
					>
						<option value="">全てのカテゴリ</option>
						<option value="uncategorized">未分類</option>
						{categories.map((category: UserCategory) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
					<select
						onChange={(e) => handleSortChange(e.target.value)}
						value={sortOrder || ""}
						className="select select-bordered select-sm w-full max-w-xs"
					>
						<option value="createdAt_desc">作成日時 (新しい順)</option>
						<option value="createdAt_asc">作成日時 (古い順)</option>
						<option value="price_asc">金額 (安い順)</option>
						<option value="price_desc">金額 (高い順)</option>
						<option value="priority">優先度</option>
					</select>
					<Link to="/items/new" className="btn btn-primary">
						新しいアイテムを追加
					</Link>
				</div>
			</div>
			<div className="overflow-x-auto" />

			{wishItems.length === 0 ? (
				<div className="text-center py-10 bg-base-100 rounded-lg shadow-sm">
					<p className="text-gray-500 mb-4">
						登録されているアイテムがありません
					</p>
					<Link to="/items/new" className="btn btn-primary">
						最初のアイテムを追加する
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{wishItems.map((item) => (
						<WishItemCard
							key={item.id}
							item={item}
							categoryName={categoryNameMapping?.[item.id] || null}
							supabaseToken={supabaseToken}
						/>
					))}
				</div>
			)}
		</>
	);
}
