import { json } from "@remix-run/node";
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import Modal from "~/components/ErrorModal"; // モーダルコンポーネントをインポート
import { createSupabaseToken, requireUser } from "~/models/auth.server";
import { getUserCategories } from "~/models/category.server";
import { createWishItem } from "~/models/wishItem.server";
import type { UserCategory } from "~/utils/types/category";

export const loader = async ({ request }: { request: Request }) => {
	try {
		const user = await requireUser(request);
		const supabaseToken = createSupabaseToken(user.userId);
		const categories = await getUserCategories(user.userId, supabaseToken);
		return json({ categories });
	} catch (error) {
		console.error("カテゴリの取得に失敗しました", error);
		return json({ categories: [] }); // エラーが発生した場合は空の配列を返す
	}
};

export const action = async ({ request }: { request: Request }) => {
	const formData = await request.formData();
	const name = formData.get("name") as string | null;
	const description = formData.get("description") as string | null;
	const product_url = formData.get("product_url") as string | null;
	const image = formData.get("image") as File | null;
	const price = formData.get("price") as string | null;
	const currency = formData.get("currency") as string | null;
	const priority = formData.get("priority") as "high" | "middle" | "low" | null;
	const user_category_id = formData.get("user_category_id") as string | null;

	if (!name || !priority || !currency) {
		return {
			success: false,
			error: "商品名、優先度、通貨は必須です",
		};
	}

	if (currency !== "JPY" && currency !== "USD") {
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
		const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
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
			image_path: null,
			image: image && image.size > 0 ? image : null,
			price: price ? Number.parseFloat(price) : null,
			currency: currency as "JPY" | "USD",
			priority,
			status: "unpurchased",
			purchase_date: null,
			purchase_price: null,
			purchase_location: null,
			user_category_id:
				user_category_id === "" ? null : user_category_id || null,
		});

		// 成功の場合、ページ遷移はクライアントサイドで行うため、成功フラグのみ返す
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
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const { categories } = useLoaderData<{ categories: UserCategory[] }>();

	const isSubmitting = navigation.state === "submitting";

	// アクションデータが変更されたときにモーダル表示を管理
	useEffect(() => {
		if (actionData?.success) {
			setShowSuccessModal(true);
		} else if (actionData?.error) {
			setShowErrorModal(true);
		}
	}, [actionData]);

	// 画像ファイルが選択されたときのハンドラー
	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// ファイルサイズと形式のチェック
			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
			];

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

	// 成功モーダルの閉じるアクション - アイテム一覧へリダイレクト
	const handleSuccessModalClose = () => {
		setShowSuccessModal(false);
		window.location.href = "/items";
	};

	// エラーモーダルの閉じるアクション
	const handleErrorModalClose = () => {
		setShowErrorModal(false);
	};

	return (
		<div className="min-h-screen py-10">
			<div className="max-w-2xl mx-auto px-4">
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body">
						<h1 className="card-title text-2xl font-bold mb-6 text-primary justify-center">
							新しいアイテムを追加
						</h1>

						{/* 成功モーダル */}
						<Modal
							isOpen={showSuccessModal}
							onClose={handleSuccessModalClose}
							title="成功"
							width="w-full max-w-md"
							actions={
								// biome-ignore lint/a11y/useButtonType:
								<button
									onClick={handleSuccessModalClose}
									className="btn btn-primary"
								>
									アイテム一覧へ
								</button>
							}
						>
							<div className="text-center py-4">
								{/* biome-ignore lint/a11y/noSvgWithoutTitle:*/}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-16 w-16 text-success mx-auto mb-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<p className="text-lg font-medium">
									アイテムが正常に追加されました！
								</p>
							</div>
						</Modal>

						{/* エラーモーダル */}
						<Modal
							isOpen={showErrorModal}
							onClose={handleErrorModalClose}
							title="エラー"
							width="w-full max-w-md"
							actions={
								// biome-ignore lint/a11y/useButtonType:
								<button
									onClick={handleErrorModalClose}
									className="btn btn-primary"
								>
									閉じる
								</button>
							}
						>
							<div className="text-center py-4">
								{/* biome-ignore lint/a11y/noSvgWithoutTitle:*/}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-16 w-16 text-error mx-auto mb-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<p className="text-lg font-medium">{actionData?.error}</p>
							</div>
						</Modal>

						<Form
							method="post"
							encType="multipart/form-data"
							className="space-y-6"
						>
							<div className="form-control">
								<label className="label" htmlFor="name">
									<span className="label-text font-medium">商品名</span>
									<span className="label-text-alt text-error">必須</span>
								</label>
								<input
									type="text"
									id="name"
									name="name"
									required
									placeholder="欲しいアイテム名を入力"
									className="input input-bordered input-primary w-full"
								/>
							</div>

							<div className="form-control">
								<label className="label" htmlFor="description">
									<span className="label-text font-medium">説明</span>
								</label>
								<textarea
									id="description"
									name="description"
									placeholder="アイテムの詳細、色、サイズなど"
									className="textarea textarea-bordered h-24"
								/>
							</div>

							<div className="form-control">
								<label className="label" htmlFor="product_url">
									<span className="label-text font-medium">商品URL</span>
								</label>
								<div className="input-group">
									<input
										type="url"
										id="product_url"
										name="product_url"
										placeholder="https://example.com/product"
										className="input input-bordered w-full"
									/>
								</div>
							</div>

							<div className="form-control">
								<label className="label" htmlFor="image">
									<span className="label-text font-medium">商品画像</span>
								</label>
								<div className="flex flex-col gap-3">
									<input
										type="file"
										id="image"
										name="image"
										accept="image/jpeg,image/png,image/gif,image/webp"
										className="file-input file-input-bordered w-full"
										onChange={handleImageChange}
										ref={fileInputRef}
									/>
									<p className="text-xs text-base-content opacity-70">
										対応形式: JPEG, PNG, GIF, WEBP (最大5MB)
									</p>

									{/* 画像プレビュー表示エリア */}
									{imagePreview && (
										<div className="mt-2">
											<div className="divider text-xs">プレビュー</div>
											<div className="relative w-48 h-48 border border-base-300 rounded-lg overflow-hidden bg-base-200">
												<img
													src={imagePreview}
													alt="画像プレビュー"
													className="object-contain w-full h-full"
												/>
												<button
													type="button"
													className="btn btn-circle btn-error btn-sm absolute top-2 right-2"
													onClick={() => {
														cleanupPreview();
														setImagePreview(null);
														if (fileInputRef.current) {
															fileInputRef.current.value = "";
														}
													}}
												>
													{/* biome-ignore lint/a11y/noSvgWithoutTitle: */}
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
							</div>

							<div className="form-control">
								<label className="label" htmlFor="price">
									<span className="label-text font-medium">価格</span>
								</label>
								<input
									type="number"
									id="price"
									name="price"
									step="0.01"
									min="0"
									placeholder="0.00"
									className="input input-bordered w-full"
								/>
							</div>

							<div className="form-control">
								<label className="label" htmlFor="currency">
									<span className="label-text font-medium">通貨</span>
									<span className="label-text-alt text-error">必須</span>
								</label>
								<select
									id="currency"
									name="currency"
									required
									className="select select-bordered w-full"
								>
									<option value="" disabled selected>
										選択してください
									</option>
									<option value="JPY">JPY (日本円)</option>
									<option value="USD">USD (米ドル)</option>
								</select>
							</div>

							{/* カテゴリ選択 */}
							<div className="form-control">
								<label className="label" htmlFor="user_category_id">
									<span className="label-text font-medium">カテゴリ</span>
								</label>
								<select
									id="user_category_id"
									name="user_category_id"
									className="select select-bordered w-full"
								>
									<option value="" disabled selected>
										選択してください
									</option>
									{categories.map((category) => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
									<option value="">未分類</option>
								</select>
							</div>

							<div className="form-control">
								<label className="label" htmlFor="priority">
									<span className="label-text font-medium">優先度</span>
									<span className="label-text-alt text-error">必須</span>
								</label>
								<div className="flex flex-col sm:flex-row gap-2">
									<label className="label cursor-pointer justify-start gap-2 flex-1 border rounded-lg p-2 hover:bg-base-200">
										<input
											type="radio"
											name="priority"
											value="high"
											className="radio radio-error"
										/>
										<span className="flex items-center gap-1">
											{/* biome-ignore lint/a11y/noSvgWithoutTitle:*/}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5 text-error"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
												/>
											</svg>
											高
										</span>
									</label>
									<label className="label cursor-pointer justify-start gap-2 flex-1 border rounded-lg p-2 hover:bg-base-200">
										<input
											type="radio"
											name="priority"
											value="middle"
											className="radio radio-warning"
										/>
										<span className="flex items-center gap-1">
											{/* biome-ignore lint/a11y/noSvgWithoutTitle:*/}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5 text-warning"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
												/>
											</svg>
											中
										</span>
									</label>
									<label className="label cursor-pointer justify-start gap-2 flex-1 border rounded-lg p-2 hover:bg-base-200">
										<input
											type="radio"
											name="priority"
											value="low"
											className="radio radio-success"
										/>
										<span className="flex items-center gap-1">
											{/* biome-ignore lint/a11y/noSvgWithoutTitle: */}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5 text-success"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
												/>
											</svg>
											低
										</span>
									</label>
								</div>
							</div>

							<div className="card-actions flex mt-8">
								<div className="justify-start">
									<a href="/items" className="btn btn-outline">
										一覧に戻る
									</a>
								</div>
								<div className="flex-grow" />
								<button type="reset" className="btn btn-outline">
									リセット
								</button>

								<button
									type="submit"
									disabled={isSubmitting}
									className="btn btn-primary"
								>
									{isSubmitting ? (
										<>
											<span className="loading loading-spinner loading-sm" />
											追加中...
										</>
									) : (
										<>
											{/* biome-ignore lint/a11y/noSvgWithoutTitle:*/}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5 mr-1"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 6v6m0 0v6m0-6h6m-6 0H6"
												/>
											</svg>
											追加
										</>
									)}
								</button>
							</div>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
}
