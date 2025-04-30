# 次に取り掛かるタスク
1. /itemsで商品の表示ロジックを修正・実装する

2. カテゴリ別に商品を分けられるようにする
  

# MVP 優先で後回しにしたタスク
1. route と component に切り分けてリファクタリングする
2. 優先度変更履歴 //本当にこれいる？


## 買いたいものリストのソートロジック
### デフォルトのソート順

優先度（高→中→低）: 最も重要な基準として、ユーザーが設定した優先度でソート
追加日時（新しい順）: 同じ優先度内では、最近追加されたアイテムを上位に表示

### ユーザーが選択できるソートオプション

優先度順: デフォルトのソート方法
追加日時順: 新しい順／古い順
価格順: 高い順／安い順（価格が設定されている場合）
商品名順: アルファベット／五十音順

### フィルタリングとの組み合わせ
ソートだけでなく、以下のフィルターと組み合わせる

優先度フィルター: 特定の優先度のみ表示
カテゴリフィルター: 特定のカテゴリのみ表示
価格帯フィルター: 設定した価格範囲内のアイテムのみ表示



# 買いたいものリストアプリ カテゴリ機能：2テーブル設計方針（修正版）

## データベース設計の特徴

**重要ポイント**: `system_categories`テーブルはアプリ全体で1つのテーブルであり、ユーザー数に関わらず各カテゴリは1レコードのみ存在します。一方、`user_categories`テーブルはユーザーごとに増えていきます。

## 修正後のデータベース設計

### テーブル構造

#### 1. `users` テーブル (変更なし)
```
- id (PK): UUID NOT NULL
- auth_id: VARCHAR(50) NOT NULL UNIQUE  // Supabaseの認証ユーザーID
- name: VARCHAR(100) NOT NULL
- email: VARCHAR(100) NOT NULL UNIQUE
- picture_url: VARCHAR(255) NULL
- created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### 2. `wish_item` テーブル (カテゴリIDカラム追加)
```
- id (PK): UUID NOT NULL
- user_id: UUID (FK → users.id) NOT NULL
- user_category_id: UUID (FK → user_categories.id) NULL  // 新規追加
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

#### 3. `priority_history` テーブル (変更なし)
```
- id (PK): UUID NOT NULL
- wish_item_id: UUID NOT NULL (FK → wish_items.id)
- old_priority: ENUM('high', 'middle', 'low') NOT NULL
- new_priority: ENUM('high', 'middle', 'low') NOT NULL
- changed_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### 4. `system_categories` テーブル (新規) - アプリ全体で1つ
```
- id (PK): UUID NOT NULL
- name: VARCHAR(50) NOT NULL UNIQUE
- description: TEXT NULL
- created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### 5. `user_categories` テーブル (新規) - ユーザーごとに作成
```
- id (PK): UUID NOT NULL
- user_id: UUID (FK → users.id) NOT NULL
- system_category_id: UUID (FK → system_categories.id) NULL
- name: VARCHAR(50) NOT NULL
- description: TEXT NULL
- created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- UNIQUE(user_id, name)
```

## データの関係

1. **システムカテゴリ (一度だけ定義)**
   - 例: 「電子機器」「衣類」「書籍」などのマスターデータ
   - システム全体で共通して使用される基本カテゴリ
   - アプリケーションの初期化時に1回だけ作成

2. **ユーザーカテゴリ (ユーザーごとに作成)**
   - 各ユーザーはシステムカテゴリをコピーした自分用カテゴリを持つ
   - システムカテゴリ由来のカテゴリは`system_category_id`で元のカテゴリと紐づけ
   - ユーザー独自のカテゴリは`system_category_id = NULL`で作成

## 実装ポイント

### 初期データ設定

1. **システムカテゴリの初期データ** (アプリ全体で1回だけ実行)
   - 「電子機器」「衣類」「書籍」などをシステムカテゴリとして登録

2. **ユーザー登録時のカテゴリ作成** (ユーザーごとに実行)
   - システムカテゴリをユーザーカテゴリテーブルにコピー
   - system_category_idに元のシステムカテゴリIDを設定

## メリット

1. **データ効率**: システムカテゴリは全ユーザーで共有（1レコードのみ）
2. **メンテナンス性**: システムカテゴリの追加・変更は中央で1回だけ行えば良い
3. **カスタマイズ性**: ユーザーは自分だけのカスタマイズが可能
4. **拡張性**: 将来的なカテゴリ機能の拡張も容易
