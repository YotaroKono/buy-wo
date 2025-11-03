import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { createSupabaseToken, requireUser } from "~/models/auth.server";
import { getWishItemWithImageUrl } from "~/models/wishItem.server";
import { getCategoryName } from "~/models/wishItem.server";
import {
	formatPrice,
	getPriorityClass,
	getPriorityLabel,
	getStatusLabel,
} from "~/utils/wishItemFormatter";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const user = await requireUser(request);
	const supabaseToken = createSupabaseToken(user.userId);
	const { id } = params;

	if (!id) {
		throw new Response("Item ID not found", { status: 404 });
	}

	const item = await getWishItemWithImageUrl(id, supabaseToken);
	if (!item) {
		throw new Response("Item not found", { status: 404 });
	}

	const categoryName = await getCategoryName(
		item.user_category_id,
		supabaseToken,
	);

	return json({ item, categoryName });
};

export default function WishItemDetail() {
	const { item, categoryName } = useLoaderData<typeof loader>();

	return (
		<div className="container mx-auto p-4">
			<div className="card lg:card-side bg-base-100 shadow-xl">
				<figure className="max-w-sm">
					{item.image_path ? (
						<img
							src={item.image_path}
							alt={item.name || "商品画像"}
							className="object-contain h-full w-full"
						/>
					) : (
						<div className="flex items-center justify-center h-96 w-full bg-gray-100 text-gray-400">
							<span>画像なし</span>
						</div>
					)}
				</figure>
				<div className="card-body">
					<h1 className="card-title text-3xl">{item.name}</h1>
					<div className="flex items-center space-x-4 my-2">
						<span className={`badge ${getPriorityClass(item.priority)}`}>
							{getPriorityLabel(item.priority)}
						</span>
						<span className="badge badge-outline">
							{getStatusLabel(item.status)}
						</span>
						{categoryName && (
							<span className="badge badge-ghost">{categoryName}</span>
						)}
					</div>
					{item.price && (
						<p className="text-2xl font-semibold">
							{formatPrice(item.price, item.currency)}
						</p>
					)}
					<p className="py-4">{item.description}</p>
					{item.product_url && (
						<a
							href={item.product_url}
							target="_blank"
							rel="noopener noreferrer"
							className="link link-primary"
						>
							商品ページへ
						</a>
					)}
					<div className="card-actions justify-end mt-4">
						<Link to="/items" className="btn">
							一覧へ戻る
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
