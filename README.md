# buy-wo

## 👀 プロジェクト概要

このアプリケーションは、ユーザーが買いたいものをリスト化し、優先度設定や購入履歴の管理などを通じて、より計画的で満足度の高い買い物体験を実現することを目的としています。



## 📚 プロジェクトドキュメント

詳細な情報は以下のドキュメントを参照してください：

- [REQUIREMENTS.md](./docs/REQUIREMENTS.md) - 機能要件の詳細仕様とロードマップ
- [ARCHTECTURE.md](./docs/ARCHTECHTURE.md) - 技術アーキテクチャと設計思想

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

# Release(Phase1)
<img width="517" height="972" alt="Screenshot 2025-11-22 at 23 16 42" src="https://github.com/user-attachments/assets/38c07703-d695-4e20-aacc-e6dba90edc6d" />
<img width="517" height="972" alt="Screenshot 2025-11-22 at 23 17 25" src="https://github.com/user-attachments/assets/57bcacdf-20f8-440e-ab4c-2c3f52b46b8e" />
<img width="517" height="972" alt="Screenshot 2025-11-22 at 23 18 22" src="https://github.com/user-attachments/assets/fd2dc539-2dc7-4728-a840-2bc645a3a847" />
<img width="381" height="990" alt="Screenshot 2025-11-22 at 23 20 30" src="https://github.com/user-attachments/assets/f9aadc9c-f7d6-4e53-9f7f-f49804b50e23" />
<img width="381" height="990" alt="Screenshot 2025-11-22 at 23 20 45" src="https://github.com/user-attachments/assets/99a1aa10-4de5-4f66-a2e2-8237272b9598" />
<img width="381" height="990" alt="Screenshot 2025-11-22 at 23 20 54" src="https://github.com/user-attachments/assets/c274abff-262f-42bc-90e5-61de2e0f5748" />

