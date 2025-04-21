import { Link } from "@remix-run/react";
import type { WishItem } from "~/utils/types/wishItem";
import { formatPrice, getPriorityClass, getPriorityLabel } from "~/utils/wishItem";

interface WishItemCardProps {
  item: WishItem;
}

export default function WishItemCard({ item }: WishItemCardProps) {
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
        
        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        )}
        
        {item.product_url && (
          <a 
            href={item.product_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline truncate block mt-1"
          >
            {item.product_url}
          </a>
        )}
        
        <div className="card-actions justify-end mt-4">
          <Link 
            to={`/items/${item.id}`} 
            className="btn btn-sm btn-outline"
          >
            詳細
          </Link>
          <Link 
            to={`/items/${item.id}/mark-purchased`} 
            className="btn btn-sm btn-primary"
          >
            購入済み
          </Link>
        </div>
      </div>
    </div>
  );
}
