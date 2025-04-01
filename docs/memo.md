# 「買いたいものリスト」アプリ機能ロードマップ
ユーザーが本当に買いたいものを見極め、適切な金額で満足度の高い買い物を計画的に実行する

## 第1段階：コア機能（MVP）

### 1. 買いたいものの追加
- 商品名、説明の基本情報入力
- 商品URLの追加と保存
- URLからの商品情報自動取得
- 手動での商品画像アップロード
- クイック追加と詳細追加オプション

### 2. 優先度設定
- 「必須」「高」「中」「低」の優先度ラベル
- 優先度による視覚的区別（色分け）
- 優先度でのフィルタリング・ソート
- 優先度変更履歴の記録

### 3. 購入完了マーク
- 購入日・購入価格の記録
- 購入場所情報の記録
- 完了アイテムの別セクション移動
- 「完了」と「キャンセル」の区別

## 第2段階：基本的な管理機能

### 4. カテゴリ別整理
- プリセットカテゴリの提供
- ユーザー独自カテゴリの作成
- カテゴリ別閲覧・フィルタリング
- カテゴリごとの統計情報表示

### 5. 購入理由・メモ記録
- テキストメモの追加・編集
- 「なぜ欲しいのか」などの質問テンプレート
- メモ追加日時の記録
- 画像や音声メモ（拡張機能）

### 6. 購入履歴の振り返り
- 時系列でのリスト表示
- 期間別（月別・年別）購入集計
- グラフ・チャートでの可視化
- データエクスポート機能

### 7. リスト共有機能
- 公開用共有リンク生成
- SNS・ウェブサイト埋め込み用URL
- 共有リスト上での購入状況管理
- プライバシー設定オプション
- 共有リストのカスタマイズ

## 第3段階：高度な計画機能

### 8. 一定期間後の再確認機能
- 一定期間経過後の通知
- 「まだ欲しいですか？」確認
- ワンクリックでの削除オプション
- 再確認頻度のカスタマイズ
- 「欲しさ」変化の記録

### 9. 予算管理機能
- 月間・年間の総予算設定
- 予算消化状況のビジュアル表示
- 予算オーバー時の警告
- 優先度に基づく購入提案
- 予算の繰り越しオプション

## 第4段階：振り返り機能

### 10. 購入後満足度評価
- 5段階評価での満足度記録
- 評価リマインダー通知
- 満足度の低いアイテムの分析
- 振り返り質問機能
- 長期的な購買習慣改善のインサイト提供

# API/DB設計

## データベース設計

### テーブル構造

#### 1. `users` テーブル
```
- id (PK): UUID
- username: VARCHAR(50)
- email: VARCHAR(100)
- password_hash: VARCHAR(255)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. `wish_items` テーブル
```
- id (PK): UUID
- user_id (FK): UUID (references users.id)
- name: VARCHAR(100)
- description: TEXT
- product_url: VARCHAR(255)
- image_url: VARCHAR(255)
- price: DECIMAL(10,2)
- currency: VARCHAR(3)
- priority: ENUM('必須', '高', '中', '低')
- status: ENUM('未購入', '購入済み', 'キャンセル')
- purchase_date: DATE
- purchase_price: DECIMAL(10,2)
- purchase_location: VARCHAR(100)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 3. `priority_history` テーブル
```
- id (PK): UUID
- wish_item_id (FK): UUID (references wish_items.id)
- old_priority: ENUM('必須', '高', '中', '低')
- new_priority: ENUM('必須', '高', '中', '低')
- changed_at: TIMESTAMP
```

## API設計

### 認証関連

#### 1. ユーザー登録
- **エンドポイント**: `POST /api/auth/register`
- **ボディ**: `{ username, email, password }`
- **レスポンス**: `{ id, username, email, token }`

#### 2. ログイン
- **エンドポイント**: `POST /api/auth/login`
- **ボディ**: `{ email, password }`
- **レスポンス**: `{ id, username, email, token }`

#### 3. ログアウト
- **エンドポイント**: `POST /api/auth/logout`
- **認証**: 必要
- **レスポンス**: `{ success: true }`

### 買いたいものリスト関連

#### 1. アイテム追加
- **エンドポイント**: `POST /api/wish-items`
- **認証**: 必要
- **ボディ**: `{ name, description?, product_url?, image_url?, price?, currency?, priority }`
- **レスポンス**: `{ id, name, ... (他のアイテム情報) }`

#### 2. アイテム一覧取得
- **エンドポイント**: `GET /api/wish-items`
- **認証**: 必要
- **クエリパラメータ**: `status?, priority?, sort_by?, sort_order?`
- **レスポンス**: `{ items: [{ id, name, ... }, ...], total_count }`

#### 3. アイテム詳細取得
- **エンドポイント**: `GET /api/wish-items/:id`
- **認証**: 必要
- **レスポンス**: `{ id, name, ... (他のアイテム詳細情報) }`

#### 4. アイテム更新
- **エンドポイント**: `PUT /api/wish-items/:id`
- **認証**: 必要
- **ボディ**: アイテム情報の各フィールド (変更したいものだけ)
- **レスポンス**: 更新されたアイテム情報

#### 5. アイテム削除
- **エンドポイント**: `DELETE /api/wish-items/:id`
- **認証**: 必要
- **レスポンス**: `{ success: true }`

#### 6. 優先度更新
- **エンドポイント**: `PATCH /api/wish-items/:id/priority`
- **認証**: 必要
- **ボディ**: `{ priority: '必須'|'高'|'中'|'低' }`
- **レスポンス**: 更新されたアイテム情報

#### 7. 購入完了マーク
- **エンドポイント**: `PATCH /api/wish-items/:id/status`
- **認証**: 必要
- **ボディ**: `{ status: '購入済み'|'キャンセル', purchase_date?, purchase_price?, purchase_location? }`
- **レスポンス**: 更新されたアイテム情報

#### 8. URL情報取得 (URLからの商品情報自動取得)
- **エンドポイント**: `POST /api/scrape-product-info`
- **認証**: 必要
- **ボディ**: `{ url }`
- **レスポンス**: `{ name, description, price, image_url }`

#### 9. 画像アップロード
- **エンドポイント**: `POST /api/uploads/images`
- **認証**: 必要
- **フォームデータ**: `image`ファイル
- **レスポンス**: `{ image_url }`

## その他の技術仕様

### 認証方式
- JWT (JSON Web Token)を使用したトークンベースの認証

### 画像保存
- クラウドストレージサービス（AWS S3など）を利用

### URL情報取得
- サーバーサイドスクレイピングまたはOGPメタタグ取得API

### データバリデーション
- 各APIエンドポイントでの入力値検証
- 必須フィールドと任意フィールドの区別

### エラーハンドリング
- 統一されたエラーレスポンス形式
- ログイン状態、アクセス権限のチェック
