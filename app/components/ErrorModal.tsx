import type { ReactNode } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	actions?: ReactNode;
	width?: string;
}

/**
 * 汎用的なモーダルコンポーネント
 * @param isOpen モーダルの表示状態
 * @param onClose モーダルを閉じる際に実行する関数
 * @param title モーダルのタイトル
 * @param children モーダルの内容
 * @param actions モーダルのアクションボタン（省略可能）
 * @param width モーダルの幅（例：'w-96'、'w-full max-w-md'）
 */
export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	actions,
	width = "w-96",
}: ModalProps) {
	if (!isOpen) return null;

	return (
		<>
			<div
				className="fixed inset-0 bg-black bg-opacity-50 z-40"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				tabIndex={0}
				role="button"
				aria-label="モーダルを閉じる"
			/>
			<div className="fixed inset-0 flex items-center justify-center z-50">
				<div className={`card ${width} bg-base-100 card-md shadow-xl`}>
					<div className="card-body">
						<h2 className="card-title justify-center">{title}</h2>
						<div className="py-2">{children}</div>
						<div className="justify-end card-actions">
							{actions || (
								// biome-ignore lint/a11y/useButtonType:
								<button onClick={onClose} className="btn btn-primary">
									閉じる
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
