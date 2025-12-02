REQUIREMENTS.md
# 「買いたいものリスト」アプリ機能ロードマップ
ユーザーが本当に買いたいものを見極め、満足度の高い買い物を計画的に実行する

## 第1段階：コア機能（MVP）

### 1. 買いたいものの追加
- 商品名、説明の基本情報入力
- 商品URLの追加と保存

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

## 第2段階：高度な計画機能

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

## 第3段階：振り返り機能

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
- id (PK): UUID NOT NULL
- auth_id: VARCHAR(50) NOT NULL UNIQUE  // Supabaseの認証ユーザーID
- name: VARCHAR(100) NOT NULL
- email: VARCHAR(100) NOT NULL UNIQUE
- picture_url: VARCHAR(255) NULL
- created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### 2. `wish_item` テーブル
```
- id (PK): UUID NOT NULL
- user_id: UUID (FK → users.id) NOT NULL
- user_category_id: UUID (FK → user_category.id) NULL  // 新規追加 NULLのものはUI上未分類として表示する。
- name: VARCHAR(100) NOT NULL
- description: TEXT NULL
- product_url: VARCHAR(255) NULL
- image_path VARCHAR(255) NULL
- price: DECIMAL(10,2) NULL 
- currency: ENUM('JPY', 'USD') NOT NULL DEFAULT 'JPY'
- priority: ENUM('high', 'middle', 'low') NOT NULL DEFAULT 'middle'
- status: ENUM('unpurchased', 'purchased') NOT NULL DEFAULT 'unpurchased'
- purchase_date: DATE NULL
- purchase_price: DECIMAL(10,2) NULL
- purchase_location: VARCHAR(100) NULL
- created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### 3. `priority_history` テーブル
```
- id (PK): UUID NOT NULL
- wish_item_id: UUID NOT NULL (FK → wish_items.id)
- old_priority: ENUM('high', 'middle', 'low') NOT NULL
- new_priority: ENUM('high', 'middle', 'low') NOT NULL
- changed_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```
#### 4. `system_category` テーブル (新規) - アプリ全体で1つ
```
- id (PK): UUID NOT NULL
- name: VARCHAR(50) NOT NULL UNIQUE
- description: TEXT NULL
- created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### 5. `user_category` テーブル (新規) - ユーザーごとに作成
```
- id (PK): UUID NOT NULL
- user_id: UUID (FK → users.id) NOT NULL
- system_category_id: UUID (FK → system_category.id) NULL // これがnullの場合、ユーザーのカスタムカテゴリとして認識される
- name: VARCHAR(50) NOT NULL
- description: TEXT NULL
- created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- UNIQUE(user_id, name)
```

# API設計（Remix + Supabase）

## 認証関連

Supabaseの認証機能を使用

## コア機能（MVP）のAPI

### 1. アイテム追加 【コア機能】
- **API関数**: `createWishItem`
- **入力**: `{ name, description?, product_url?, image_path?, price?, currency?, priority }`
- **出力**: 作成されたアイテムオブジェクト
- **実装場所**: `/app/models/wish-item.server.ts`
- **呼び出し元**: `/app/routes/items/new.tsx` など

### 2. アイテム一覧取得 【コア機能】
- **API関数**: `getWishItems`
- **入力**: `{ userId, status?, priority?, sort_by?, sort_order? }`
- **出力**: アイテムオブジェクトの配列
- **実装場所**: `/app/models/wish-item.server.ts`
- **呼び出し元**: `/app/routes/items/index.tsx` など

### 3. アイテム詳細取得 【コア機能】
- **API関数**: `getWishItem`
- **入力**: `{ itemId, userId }`
- **出力**: アイテムオブジェクト
- **実装場所**: `/app/models/wish-item.server.ts`
- **呼び出し元**: `/app/routes/items/$itemId.tsx` など

### 4. アイテム更新 【コア機能】
- **API関数**: `updateWishItem`
- **入力**: `{ itemId, userId, ...更新フィールド }`
- **出力**: 更新されたアイテムオブジェクト
- **実装場所**: `/app/models/wish-item.server.ts`
- **呼び出し元**: `/app/routes/items/$itemId/edit.tsx` など

### 5. アイテム削除 【コア機能】
- **API関数**: `deleteWishItem`
- **入力**: `{ itemId, userId }`
- **出力**: 削除結果
- **実装場所**: `/app/models/wish-item.server.ts`
- **呼び出し元**: `/app/routes/items/$itemId/delete.tsx` など

### 6. 優先度更新 【コア機能】
- **API関数**: `updateItemPriority`
- **入力**: `{ itemId, userId, priority, updateHistory = true }`
- **出力**: 更新されたアイテムオブジェクト
- **実装場所**: `/app/models/wish-item.server.ts`
- **呼び出し元**: `/app/routes/items/$itemId/priority.tsx` など
- **注**: 履歴も記録するため、トランザクション処理を含む

### 7. 購入完了マーク 【コア機能】
- **API関数**: `markItemStatus`
- **入力**: `{ itemId, userId, status, purchase_date?, purchase_price?, purchase_location? }`
- **出力**: 更新されたアイテムオブジェクト
- **実装場所**: `/app/models/wish-item.server.ts`
- **呼び出し元**: `/app/routes/items/$itemId/mark-purchased.tsx` など


## 拡張機能のAPI（第2段階以降）

### 8. カテゴリ管理
- **API関数**: `createCategory`, `getCategories`, `updateCategory`, `deleteCategory`
- **実装場所**: `/app/models/category.server.ts`

### 9. アイテムへのメモ追加
- **API関数**: `addItemNote`, `getItemNotes`, `updateItemNote`, `deleteItemNote`
- **実装場所**: `/app/models/note.server.ts`

### 10. 購入履歴統計
- **API関数**: `getPurchaseStats`
- **実装場所**: `/app/models/stats.server.ts`

### 11. リスト共有
- **API関数**: `createShareableLink`, `getSharedList`, `updateShareSettings`
- **実装場所**: `/app/models/share.server.ts`

### 12. 画像アップロード
- **API関数**: `uploadImage`
- **実装場所**: `/app/utils/storage.server.ts`
- **呼び出し元**: `/app/routes/api/upload-image.tsx`
- **注**: SupabaseのStorage機能を利用

## その他の技術仕様

### 認証方式
- Supabaseの認証機能を使用
- セッションベースの認証（RemixのSessionStorage）

### 画像保存
- Supabase Storageを利用

### URL情報取得(MVPでは実装しない)
- サーバーサイドスクレイピング（cheerio, puppeteerなど）
- OGPメタタグの取得
- 

### エラーハンドリング
- Remixのエラーバウンダリを活用
- 一貫したエラーレスポンス形式の提供



# 追加したい機能
1. 気になるオンラインサイトを登録できる
2. 気になる店舗を地図上で、画像と共に確認できる
3. 周りの友人が今何を欲しがっているのか知ることができる
