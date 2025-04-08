import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUser, createSupabaseToken } from "~/models/auth.server";
import { getWishItems, WishItem } from "~/models/wishItem.server";

// ローダーの返り値の型を定義
type LoaderData = 
  | { success: true; wishItems: WishItem[]; error?: never }
  | { success: false; error: string; wishItems?: never };

export const loader = async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
  try {
    const user = await requireUser(request);
    const supabaseToken = createSupabaseToken(user.userId);
    let wishItems = await getWishItems(user.userId, supabaseToken);
    return { success: true, wishItems: wishItems};
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch wish items" };
  }
};

export default function WishItemsIndex() {
  const data = useLoaderData<typeof loader>();

  // 優先度に応じた色クラスを返す関数
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'badge-error';
      case 'middle': return 'badge-warning';
      case 'low': return 'badge-info';
      default: return 'badge-ghost';
    }
  };
  
  // 価格表示のフォーマット
  const formatPrice = (price: number | null, currency: string | null | undefined = 'JPY') => {
    if (!price) return '';
    
    // nullやundefinedの場合はデフォルト値を使用
    const currencyCode = currency || 'JPY';
    
    // 通貨ごとにロケールとフォーマットオプションを設定
    const formatOptions: Record<string, { locale: string, options: Intl.NumberFormatOptions }> = {
      'JPY': {
        locale: 'ja-JP',
        options: {
          style: 'currency',
          currency: 'JPY',
          currencyDisplay: 'symbol'
        }
      },
      'USD': {
        locale: 'en-US',
        options: {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'symbol'
        }
      }
    };
    
    // 設定された通貨のフォーマットがあれば使用、なければデフォルト設定
    const format = formatOptions[currencyCode] || {
      locale: 'ja-JP',
      options: { style: 'currency', currency: currencyCode }
    };
    
    return new Intl.NumberFormat(format.locale, format.options).format(price);
  };

  // データの状態に基づいて表示を切り替え
  if (!data.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-base-200 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-error mb-4">エラーが発生しました</h1>
        <p className="text-gray-600 mb-6">{data.error}</p>
        <Link to="/" className="btn btn-primary">
          ホームに戻る
        </Link>
      </div>
    );
  }

  // 成功時の表示
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">買いたいものリスト</h1>
        <Link to="/items/new" className="btn btn-primary">
          新しいアイテムを追加
        </Link>
      </div>
      
      {data.wishItems.length === 0 ? (
        <div className="text-center py-10 bg-base-100 rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">登録されているアイテムがありません</p>
          <Link to="/items/new" className="btn btn-primary">
            最初のアイテムを追加する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.wishItems.map((item) => (
            <div key={item.id} className="card bg-base-100 shadow-sm">
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
                  <span className={`badge ${getPriorityClass(item.priority || 'middle')}`}>
                    {item.priority === 'high' ? '高' : item.priority === 'middle' ? '中' : '低'}
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
          ))}
        </div>
      )}
    </div>
  );
}