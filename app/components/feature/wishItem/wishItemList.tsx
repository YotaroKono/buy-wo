import { Link } from "@remix-run/react";
import type { WishItem } from "~/utils/types/wishItem";
import WishItemCard from "./wishItemCard";

interface WishItemListProps {
  wishItems: WishItem[];
  title?: string;
}

export default function WishItemList({ wishItems, title = "買いたいものリスト" }: WishItemListProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Link to="/items/new" className="btn btn-primary">
          新しいアイテムを追加
        </Link>
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