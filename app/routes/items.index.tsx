import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
    const wishItems = await getWishItems(user.userId, supabaseToken);
    
    return { success: true, wishItems };
  } 
  catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch wish items" };
  }
};

export default function WishItemsIndex() {
  const data = useLoaderData<typeof loader>();

  // データの状態に基づいて表示を切り替え
  if (!data.success) {
    return (
      <div className="error-container">
        <h1>エラーが発生しました</h1>
        <p>{data.error}</p>
        {/* エラー時の追加のUI要素 */}
      </div>
    );
  }

  // 成功時の表示
  return (
    <div>
      <h1>Wish List</h1>
      {/* データが正常に取得できた場合の表示 */}
      <ul>
        {data.wishItems.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
