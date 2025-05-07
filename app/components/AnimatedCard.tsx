// app/components/AnimatedCard.tsx
import { useEffect, useRef, useState } from "react";
import LogoAnimation from "./LogoAnimation";

export default function AnimatedCard() {
	const cardRef = useRef<HTMLDivElement>(null);
	const [isAnimationReady, setIsAnimationReady] = useState(false);

	// anime.jsを動的にロード (CDN経由)
	useEffect(() => {
		if (typeof window === "undefined") return;

		// すでにロード済みかチェック
		if (window.anime) {
			setIsAnimationReady(true);
			return;
		}

		// スクリプトが存在するかチェック
		const existingScript = document.getElementById("anime-js-script");
		if (!existingScript) {
			const script = document.createElement("script");
			script.src =
				"https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js";
			script.id = "anime-js-script";
			script.async = true;
			script.onload = () => {
				setIsAnimationReady(true);
			};
			document.body.appendChild(script);
		} else {
			// すでにスクリプトが存在する場合、ロード完了を待つ
			const checkAnime = setInterval(() => {
				if (window.anime) {
					setIsAnimationReady(true);
					clearInterval(checkAnime);
				}
			}, 100);
		}
	}, []);

	// アニメーションの初期化
	useEffect(() => {
		// アニメーションの準備ができていないか、DOM要素が存在しない場合は処理しない
		if (!isAnimationReady || !cardRef.current || !window.anime) return;

		// DOMの準備が完了するのを待つ
		const timeoutId = setTimeout(() => {
			try {
				// カードの初期アニメーション
				window.anime({
					targets: cardRef.current,
					translateY: [20, 0], // 調整: 少し上から
					opacity: [0, 1],
					duration: 800, // 調整: 少し短く
					easing: "easeOutExpo",
				});
			} catch (error) {
				console.error("アニメーション初期化中にエラーが発生しました:", error);
			}
		}, 200);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [isAnimationReady]);

	return (
		<div className="flex flex-col justify-center items-center min-h-screen p-4">
			<div ref={cardRef} className="card w-96 bg-gray-800 shadow-lg">
				<div className="card-body">
					<LogoAnimation />
					{/* ログインフォーム */}
					<form action="/api/login" method="post" className="mt-4">
						<button type="submit" className="btn btn-warning w-full">
							ログイン / 会員登録
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
