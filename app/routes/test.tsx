// app/routes/_index.tsx
import type { MetaFunction } from "@remix-run/node";
import AnimatedCard from "~/components/AnimatedCard";
import { ClientOnly } from "~/utils/client-only";

export const meta: MetaFunction = () => {
	return [
		{ title: "Anime.js + DaisyUI Demo" },
		{
			name: "description",
			content: "Beautiful animations with anime.js and DaisyUI",
		},
	];
};

export default function Index() {
	return (
		<div className="min-h-screen">
			<ClientOnly
				fallback={
					<div className="min-h-screen flex justify-center items-center">
						<div className="card w-96 shadow-lg">
							<div className="card-body">
								<h2 className="card-title text-primary">読み込み中...</h2>
								<p>アニメーションを準備しています</p>
							</div>
						</div>
					</div>
				}
			>
				<AnimatedCard />
			</ClientOnly>
		</div>
	);
}
