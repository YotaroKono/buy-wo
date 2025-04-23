import { ActionFunctionArgs, json } from "@remix-run/node";
import { requireUser } from "~/models/auth.server";
import { toggleItemPurchaseStatus } from "~/models/wishItem.server";
import { createSupabaseToken } from "~/models/auth.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    // ユーザー認証
    const user = await requireUser(request);
    const supabaseToken = createSupabaseToken(user.userId);
    const itemId = params.id
    
    if (!itemId) {
      throw new Error("アイテムIDが指定されていません");
    }
    
    // 購入状態をトグル
    const result = await toggleItemPurchaseStatus(
      itemId, 
      user.userId,
      supabaseToken
    );
    
    return json(result);
  } catch (error) {
    console.error("Failed to toggle purchase status:", error);
    return json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "購入状態の更新に失敗しました"
      }, 
      { status: 500 }
    );
  }
};