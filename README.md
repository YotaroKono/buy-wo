# buy-wo

## 👀 プロジェクト概要

このアプリケーションは、ユーザーが買いたいものをリスト化し、優先度設定や購入履歴の管理などを通じて、より計画的で満足度の高い買い物体験を実現することを目的としています。

## 📚 プロジェクトドキュメント

詳細な情報は以下のドキュメントを参照してください：

- [REQUIREMENTS.md](./docs/REQUIREMENTS.md) - 機能要件の詳細仕様とロードマップ
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 技術アーキテクチャと設計思想

## 🛠️ 技術スタック

- **フロントエンド**: React 18, Remix
- **バックエンド**: Remix (Node.js)
- **データベース**: PostgreSQL (Supabase)
- **認証**: Auth0
- **ストレージ**: Supabase Storage
- **スタイリング**: Tailwind CSS, DaisyUI
- **ビルドツール**: Vite
- **リンター/フォーマッター**: Biome

## 🚀 環境構築手順

### 前提条件

- Node.js (v20.x 以上)
- npm
- Supabaseアカウント

### セットアップ

1. リポジトリのクローン:

```bash
git clone [repository-url]
```

2. 環境変数の設定:

`.env` ファイルを作成

3. Dockerコンテナの起動:
```
docker-compose up
```
これで `http://localhost:5173` でアプリケーションにアクセスできます。


## 📁 プロジェクト構造

```
app/
├── models/          # データアクセス層とビジネスロジック
│   └── *.server.ts  # サーバーサイドのみで実行されるコード
├── routes/          
│   └── */           
└── components/      # UIコンポーネント
    └── features/    # 機能別コンポーネント
```

## 📝 開発ワークフロー

1. **models/** にデータアクセス関数を追加
   - Supabaseとのやり取りを行う関数を実装
   - データの型定義やAPI関数を定義

2. **routes/** にルートを追加
   - URLパスに対応するルートファイルを作成
   - `loader`関数で必要なデータを取得
   - `action`関数でデータ更新処理を実行

3. **components/** にUIコンポーネントを追加
   - ルートから渡されたデータを表示するコンポーネント
   - ユーザー入力を処理するフォームコンポーネント

## 📊 開発ロードマップ

詳しい開発ロードマップは [REQUIREMENTS.md](./docs/REQUIREMENTS.md) を参照してください。