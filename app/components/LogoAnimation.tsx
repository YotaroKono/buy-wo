// app/components/LogoAnimation.tsx
import { useEffect, useRef, useState } from "react";

export default function LogoAnimation() {
	const svgRef = useRef<SVGSVGElement>(null);
	const [isAnimationReady, setIsAnimationReady] = useState(false);

	// anime.jsを動的にロード (CDN経由)
	useEffect(() => {
		if (typeof window !== "undefined") {
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
		}
	}, []);

	// アニメーションの初期化
	useEffect(() => {
		// アニメーションの準備ができていないか、SVG要素が存在しない場合は処理しない
		if (
			!isAnimationReady ||
			!svgRef.current ||
			typeof window === "undefined" ||
			!window.anime
		)
			return;

		// 少し遅延を入れてDOMが完全に描画されるのを待つ
		const timeoutId = setTimeout(() => {
			try {
				// SVG内の各要素を選択
				const logoSquare = svgRef.current?.querySelector("#logo-square");
				const logoCircle = svgRef.current?.querySelector("#logo-dot");
				const logoLetters = svgRef.current?.querySelectorAll("#logo-text path");

				if (
					!logoSquare ||
					!logoCircle ||
					!logoLetters ||
					logoLetters.length === 0
				) {
					console.warn("SVG要素を見つけられませんでした");
					return;
				}

				// アニメーションのタイムライン作成
				const timeline = window.anime.timeline({
					easing: "easeOutExpo",
					duration: 800,
				});

				// 四角形のアニメーション
				timeline.add({
					targets: logoSquare,
					opacity: [0, 1],
					scale: [0.5, 1],
					rotate: [45, 0],
					duration: 1000,
				});

				// 丸のアニメーション
				timeline.add(
					{
						targets: logoCircle,
						opacity: [0, 1],
						scale: [0, 1],
						duration: 600,
					},
					"-=400",
				);

				// テキストのアニメーション (各文字ごとに)
				logoLetters.forEach((letter, i) => {
					timeline.add(
						{
							targets: letter,
							opacity: [0, 1],
							translateY: [20, 0],
							duration: 400,
							delay: i * 100,
						},
						"-=300",
					);
				});

				// マウスホバー時のアニメーション
				const hoverAnimation = window.anime({
					targets: logoSquare,
					rotate: "1turn",
					duration: 1600,
					autoplay: false,
					easing: "easeInOutSine",
				});

				// イベントリスナー追加
				const svgElement = svgRef.current;
				if (svgElement) {
					// nullチェックを追加
					const handleMouseEnter = () => hoverAnimation.play();
					svgElement.addEventListener("mouseenter", handleMouseEnter);

					// クリーンアップ関数を返す
					return () => {
						svgElement.removeEventListener("mouseenter", handleMouseEnter);
					};
				}
			} catch (error) {
				console.error("アニメーション初期化中にエラーが発生しました:", error);
			}
		}, 200); // 200ミリ秒の遅延

		// クリーンアップ
		return () => {
			clearTimeout(timeoutId);
		};
	}, [isAnimationReady]);

	return (
		<div className="flex justify-center items-center p-8">
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
			<svg
				ref={svgRef}
				xmlns="http://www.w3.org/2000/svg"
				xmlnsXlink="http://www.w3.org/1999/xlink"
				width="280"
				height="180"
				viewBox="0 0 104.88 67.499998"
				preserveAspectRatio="xMidYMid meet"
				version="1.0"
				className="cursor-pointer"
			>
				<defs>
					<clipPath id="square-clip">
						<path
							d="M 84.117188 30.527344 L 97.855469 30.527344 L 97.855469 44.265625 L 84.117188 44.265625 Z M 84.117188 30.527344 "
							clipRule="nonzero"
						/>
					</clipPath>
					<clipPath id="square-inner-clip">
						<path
							d="M 90.984375 30.527344 L 97.855469 37.398438 L 90.984375 44.265625 L 84.117188 37.398438 Z M 90.984375 30.527344 "
							clipRule="nonzero"
						/>
					</clipPath>
					<clipPath id="dot-clip">
						<path
							d="M 55.066406 35.535156 L 58.9375 35.535156 L 58.9375 39.257812 L 55.066406 39.257812 Z M 55.066406 35.535156 "
							clipRule="nonzero"
						/>
					</clipPath>
				</defs>
				<g id="logo-square" clipPath="url(#square-clip)">
					<g clipPath="url(#square-inner-clip)">
						<path
							fill="#efaf00"
							d="M 84.117188 30.527344 L 97.855469 30.527344 L 97.855469 44.265625 L 84.117188 44.265625 Z M 84.117188 30.527344 "
							fillOpacity="1"
							fillRule="nonzero"
						/>
					</g>
				</g>
				<g id="logo-dot" clipPath="url(#dot-clip)">
					<path
						fill="#efaf00"
						d="M 55.066406 35.535156 L 58.933594 35.535156 L 58.933594 39.257812 L 55.066406 39.257812 Z M 55.066406 35.535156 "
						fillOpacity="1"
						fillRule="nonzero"
					/>
				</g>
				<g id="logo-text" fill="#efaf00" fillOpacity="1">
					<g transform="translate(7.026398, 44.461329)">
						<g>
							<path d="M 8.84375 0.34375 C 7.539062 0.34375 6.3125 -0.253906 5.15625 -1.453125 L 5.078125 -1.453125 L 4.765625 0 L 1.9375 0 L 1.9375 -19.59375 L 5.515625 -19.59375 L 5.515625 -14.65625 L 5.453125 -12.4375 C 5.992188 -12.9375 6.59375 -13.335938 7.25 -13.640625 C 7.914062 -13.941406 8.582031 -14.09375 9.25 -14.09375 C 10.382812 -14.09375 11.351562 -13.800781 12.15625 -13.21875 C 12.96875 -12.632812 13.585938 -11.820312 14.015625 -10.78125 C 14.453125 -9.75 14.671875 -8.53125 14.671875 -7.125 C 14.671875 -5.550781 14.394531 -4.207031 13.84375 -3.09375 C 13.289062 -1.976562 12.570312 -1.125 11.6875 -0.53125 C 10.800781 0.0507812 9.851562 0.34375 8.84375 0.34375 Z M 8.03125 -2.625 C 8.863281 -2.625 9.5625 -2.988281 10.125 -3.71875 C 10.6875 -4.445312 10.96875 -5.554688 10.96875 -7.046875 C 10.96875 -8.359375 10.75 -9.363281 10.3125 -10.0625 C 9.882812 -10.769531 9.195312 -11.125 8.25 -11.125 C 7.789062 -11.125 7.335938 -11.003906 6.890625 -10.765625 C 6.453125 -10.523438 5.992188 -10.171875 5.515625 -9.703125 L 5.515625 -3.65625 C 5.941406 -3.28125 6.375 -3.015625 6.8125 -2.859375 C 7.257812 -2.703125 7.664062 -2.625 8.03125 -2.625 Z M 8.03125 -2.625 " />
						</g>
					</g>
				</g>
				<g id="logo-text" fill="#ffffff" fillOpacity="1">
					<g transform="translate(22.836353, 44.461329)">
						<g>
							<path d="M 6.015625 0.34375 C 4.546875 0.34375 3.472656 -0.140625 2.796875 -1.109375 C 2.128906 -2.085938 1.796875 -3.4375 1.796875 -5.15625 L 1.796875 -13.75 L 5.40625 -13.75 L 5.40625 -5.625 C 5.40625 -4.5625 5.554688 -3.816406 5.859375 -3.390625 C 6.171875 -2.960938 6.65625 -2.75 7.3125 -2.75 C 7.882812 -2.75 8.378906 -2.882812 8.796875 -3.15625 C 9.210938 -3.425781 9.648438 -3.863281 10.109375 -4.46875 L 10.109375 -13.75 L 13.71875 -13.75 L 13.71875 0 L 10.78125 0 L 10.5 -1.96875 L 10.40625 -1.96875 C 9.820312 -1.257812 9.179688 -0.695312 8.484375 -0.28125 C 7.785156 0.132812 6.960938 0.34375 6.015625 0.34375 Z M 6.015625 0.34375 " />
						</g>
					</g>
				</g>
				<g id="logo-text" fill="#ffffff" fillOpacity="1">
					<g transform="translate(38.465927, 44.461329)">
						<g>
							<path d="M 3.140625 5.515625 C 2.734375 5.515625 2.382812 5.488281 2.09375 5.4375 C 1.8125 5.394531 1.53125 5.332031 1.25 5.25 L 1.921875 2.484375 C 2.046875 2.515625 2.191406 2.550781 2.359375 2.59375 C 2.535156 2.632812 2.707031 2.65625 2.875 2.65625 C 3.570312 2.65625 4.125 2.457031 4.53125 2.0625 C 4.945312 1.664062 5.253906 1.164062 5.453125 0.5625 L 5.6875 -0.25 L 0.34375 -13.75 L 3.984375 -13.75 L 6.15625 -7.359375 C 6.375 -6.753906 6.570312 -6.125 6.75 -5.46875 C 6.925781 -4.8125 7.113281 -4.148438 7.3125 -3.484375 L 7.4375 -3.484375 C 7.601562 -4.117188 7.765625 -4.765625 7.921875 -5.421875 C 8.085938 -6.078125 8.253906 -6.722656 8.421875 -7.359375 L 10.3125 -13.75 L 13.765625 -13.75 L 8.890625 0.421875 C 8.492188 1.492188 8.046875 2.410156 7.546875 3.171875 C 7.046875 3.929688 6.441406 4.507812 5.734375 4.90625 C 5.035156 5.3125 4.171875 5.515625 3.140625 5.515625 Z M 3.140625 5.515625 " />
						</g>
					</g>
				</g>
				<g id="logo-text" fill="#ffffff" fillOpacity="1">
					<g transform="translate(61.447469, 44.461329)">
						<g>
							<path d="M 4.21875 0 L 0.65625 -13.75 L 4.265625 -13.75 L 5.765625 -6.953125 C 5.898438 -6.296875 6.019531 -5.628906 6.125 -4.953125 C 6.226562 -4.285156 6.335938 -3.617188 6.453125 -2.953125 L 6.546875 -2.953125 C 6.679688 -3.617188 6.816406 -4.285156 6.953125 -4.953125 C 7.097656 -5.628906 7.25 -6.296875 7.40625 -6.953125 L 9.0625 -13.75 L 12.265625 -13.75 L 13.984375 -6.953125 C 14.148438 -6.296875 14.296875 -5.628906 14.421875 -4.953125 C 14.554688 -4.285156 14.695312 -3.617188 14.84375 -2.953125 L 14.96875 -2.953125 C 15.101562 -3.617188 15.21875 -4.285156 15.3125 -4.953125 C 15.414062 -5.628906 15.53125 -6.296875 15.65625 -6.953125 L 17.15625 -13.75 L 20.5 -13.75 L 17.109375 0 L 12.859375 0 L 11.421875 -5.984375 C 11.265625 -6.640625 11.125 -7.289062 11 -7.9375 C 10.882812 -8.582031 10.757812 -9.265625 10.625 -9.984375 L 10.5 -9.984375 C 10.375 -9.265625 10.253906 -8.578125 10.140625 -7.921875 C 10.023438 -7.273438 9.894531 -6.628906 9.75 -5.984375 L 8.34375 0 Z M 4.21875 0 " />
						</g>
					</g>
				</g>
			</svg>
		</div>
	);
}

// グローバル型定義の拡張
declare global {
	interface Window {
		// biome-ignore lint/suspicious/noExplicitAny:
		anime?: any;
	}
}
