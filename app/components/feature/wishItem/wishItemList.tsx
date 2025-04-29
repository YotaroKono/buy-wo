import { Link } from "@remix-run/react";
import type { WishItem } from "~/utils/types/wishItem";
import WishItemCard from "./wishItemCard";

interface WishItemListProps {
  wishItems: WishItem[];
  title?: string;
  onSortChange?: (sortBy: string) => void;
  sortOrder?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
}

export default function WishItemList({ wishItems, title = "買いたいものリスト", onSortChange, sortOrder }: WishItemListProps) {
  const handleSortChange = (value: string) => {
    if (onSortChange) {
      onSortChange(value);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center space-x-2">
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
      <div className ="overflow-x-auto">

      </div>

      {wishItems.length === 0 ? (
        <div className="text-center py-10 bg-base-100 rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">登録されているアイテムがありません</p>
          <Link to="/items/new" className="btn btn-primary">
            最初のアイテムを追加する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishItems.map((item) => (
            <WishItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
