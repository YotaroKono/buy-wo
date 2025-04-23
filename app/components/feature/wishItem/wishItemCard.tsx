import { useState } from "react";
import { Link, useFetcher } from "@remix-run/react";
import type { WishItem } from "~/utils/types/wishItem.ts";
import { formatPrice, getPriorityClass, getPriorityLabel, getStatusLabel } from "~/utils/wishItemFormatter";

interface WishItemCardProps {
  item: WishItem;
}

export default function WishItemCard({ item }: WishItemCardProps) {
  // 初期状態はアイテムのステータスから設定
  const [status, setStatus] = useState<"unpurchased" | "purchased">(item.status || "unpurchased");
  const isPurchased = status === "purchased";
  
  // APIを呼び出すためのfetcher
  const fetcher = useFetcher();
  
  // 購入状態をトグルする関数
  const handleToggleStatus = () => {
    // Optimistic UI更新（即時反映）
    const newStatus = status === "purchased" ? "unpurchased" : "purchased";
    setStatus(newStatus);
    
    // APIを呼び出して実際にデータを更新
    fetcher.submit(
      {}, // データはサーバー側で処理するため空オブジェクト
      { 
        method: "post", 
        action: `/api/items/${item.id}/toggle-status`
      }
    );
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <figure className="h-48 bg-gray-100 py-2">
        {item.image_path ? (
          <img
            src={item.image_path}
            alt={item.name || '商品画像'}
            className="object-contain h-full w-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-gray-400">
            <span>画像なし</span>
          </div>
        )}
      </figure>
      
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-lg">{item.name}</h2>
          <span className={`badge ${getPriorityClass(item.priority)}`}>
            {getPriorityLabel(item.priority)}
          </span>
        </div>
        
        {item.price && (
          <p className="font-semibold text-lg">{formatPrice(item.price, item.currency)}</p>
        )}
        
        <div className="card-actions justify-end mt-4">
          <Link 
            to={`/items/${item.id}`} 
            className="btn btn-sm btn-outline"
          >
            詳細
          </Link>
          
          <label className="swap">
            <input 
              type="checkbox" 
              checked={isPurchased}
              onChange={handleToggleStatus}
              className="hidden" // チェックボックスは非表示
            />
            <div className="swap-on btn btn-sm btn-success">購入済み</div>
            <div className="swap-off btn btn-sm btn-primary">未購入</div>
          </label>
        </div>
      </div>
    </div>
  );
}
