import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState, useRef } from "react";
import { createWishItem } from "~/models/wishItem.server";
import { requireUser, createSupabaseToken } from "~/models/auth.server";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string | null;
  const description = formData.get("description") as string | null;
  const product_url = formData.get("product_url") as string | null;
  const image = formData.get("image") as File | null;
  const price = formData.get("price") as string | null;
  const currency = formData.get("currency") as string | null;
  const priority = formData.get("priority") as "high" | "middle" | "low" | null;

  if (!name || !priority || !currency) {
    return {
      success: false,
      error: "商品名、優先度、通貨は必須です",
    };
  }

  if (currency !== 'JPY' && currency !== 'USD') {
    return {
      success: false,
      error: "通貨は JPY または USD を指定してください。",
    };
  }

  // 画像ファイルのバリデーション
  if (image && image.size > 0) {
    // ファイルサイズを5MBに制限
    if (image.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "画像サイズは5MB以下にしてください",
      };
    }

    // ファイルタイプをチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return {
        success: false,
        error: "対応している画像形式は JPEG, PNG, GIF, WEBP のみです",
      };
    }
  }

  try {
    const user = await requireUser(request);
    const supabaseToken = createSupabaseToken(user.userId);

    await createWishItem(user.userId, supabaseToken, {
      name,
      description,
      product_url,
      // image_pathはnullに設定し、imageプロパティも渡す
      image_path: null,
      image: image && image.size > 0 ? image : null,
      price: price ? parseFloat(price) : null,
      currency: currency as 'JPY' | 'USD',
      priority,
      status: "unpurchased",
      purchase_date: null,
      purchase_price: null,
      purchase_location: null,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "アイテムの作成に失敗しました" };
  }
};

export default function NewItem() {
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const navigation = useNavigation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = navigation.state === "submitting";

  // 画像ファイルが選択されたときのハンドラー
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ファイルサイズと形式のチェック
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (file.size > 5 * 1024 * 1024) {
        alert("画像サイズは5MB以下にしてください");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setImagePreview(null);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert("対応している画像形式は JPEG, PNG, GIF, WEBP のみです");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setImagePreview(null);
        return;
      }
      
      // プレビュー用のURLを作成
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  // コンポーネントがアンマウントされたときにURLを解放
  const cleanupPreview = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  // フォーム送信成功後にプレビューをクリア
  if (actionData?.success && imagePreview) {
    cleanupPreview();
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">新しいアイテムを追加</h1>

      {actionData?.error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{actionData.error}</span>
          </div>
        </div>
      )}

      {actionData?.success && (
        <div className="alert alert-success shadow-lg mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>アイテムが正常に追加されました！</span>
          </div>
        </div>
      )}

      {/* encType="multipart/form-data" を追加 */}
      <Form method="post" encType="multipart/form-data" className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            商品名
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <textarea
            id="description"
            name="description"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="product_url" className="block text-sm font-medium text-gray-700">
            商品URL
          </label>
          <input
            type="url"
            id="product_url"
            name="product_url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            商品画像
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          <p className="text-xs text-gray-500 mt-1">
            対応形式: JPEG, PNG, GIF, WEBP (最大5MB)
          </p>
          
          {/* 画像プレビュー表示エリア */}
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">プレビュー</p>
              <div className="relative w-48 h-48 border border-gray-200 rounded-md overflow-hidden">
                <img
                  src={imagePreview}
                  alt="画像プレビュー"
                  className="object-contain w-full h-full"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                  onClick={() => {
                    cleanupPreview();
                    setImagePreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            価格
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            通貨
          </label>
          <select
            id="currency"
            name="currency"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="" disabled>選択してください</option>
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            優先度
          </label>
          <select
            id="priority"
            name="priority"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="" disabled>選択してください</option>
            <option value="high">高</option>
            <option value="middle">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? "追加中..." : "追加"}
        </button>
      </Form>
    </div>
  );
}