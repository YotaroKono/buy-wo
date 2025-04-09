# 買いたいものリストアプリ

ユーザーが本当に買いたいものを見極め、適切な金額で満足度の高い買い物を計画的に実行するためのウェブアプリケーション

## 技術スタック

- **フロントエンド/バックエンド**: [Remix](https://remix.run/)
- **データベース**: [Supabase](https://supabase.io/)
- **認証**: [Auth0](https://auth0.com/)
- **スタイリング**: TailwindCSS DaisyUI

## ディレクトリ構成と設計思想

このプロジェクトは、関心の分離を重視した構造になっています：

```
app/
├── models/          # データアクセス層とビジネスロジック
│   └── *.server.ts  # サーバーサイドのみで実行されるコード
├── routes/          # Remixのルート（URLパスに対応）
│   └── */           # 各機能のルート
└── components/      # UIコンポーネント
    └── features/    # 機能別コンポーネント
```

### 設計原則

1. **関心の分離**
   - **models/** - DBアクセスとビジネスロジック
   - **routes/** - ルーティングとデータフロー管理
   - **components/** - UIの表示と相互作用

2. **サーバー/クライアント分離**
   - `.server.ts` サフィックスを使用してサーバーサイド専用コードを明示
   - クライアントバンドルサイズの最適化

3. **Remixのパラダイムの活用**
   - `loader`/`action`関数でのデータフローの管理
   - Formコンポーネントを活用したプログレッシブエンハンスメント

## コード例

### データモデル (app/models/wishItem.server.ts)

```typescript
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアント初期化
const supabase = createClient(/* 設定省略 */);

export type WishItem = {
  id: string;
  name: string;
  priority: '必須' | '高' | '中' | '低';
  status: '未購入' | '購入済み' | 'キャンセル';
  // 他のフィールド省略
};

// アイテム一覧取得
export async function getWishItems(request: Request) {
  const session = await getSession(request);
  const userId = session.get('userId');
  
  const { data, error } = await supabase
    .from('wish_items')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw new Error(error.message);
  return data as WishItem[];
}

// 新規作成
export async function createWishItem(request: Request, data: FormData) {
  // 実装省略
}

// その他のCRUD関数
```

### ルート (app/routes/wish-items/_index.tsx)

```typescript
import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getWishItems } from '~/models/wishItem.server';
import WishItemList from '~/components/features/wish-item/WishItemList';

export const loader = async ({ request }: LoaderArgs) => {
  try {
    const items = await getWishItems(request);
    return json({ items });
  } catch (error) {
    return json({ error: (error as Error).message }, { status: 500 });
  }
};

export default function WishItemsIndex() {
  const { items } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>買いたいものリスト</h1>
      <WishItemList items={items} />
    </div>
  );
}
```

### コンポーネント (app/components/features/wish-item/WishItemList.tsx)

```typescript
import { Link } from '@remix-run/react';
import type { WishItem } from '~/models/wishItem.server';

interface WishItemListProps {
  items: WishItem[];
}

export default function WishItemList({ items }: WishItemListProps) {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2>アイテム一覧</h2>
        <Link to="/wish-items/new" className="button">新規追加</Link>
      </div>
      
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="p-3 border rounded">
            <Link to={`/wish-items/${item.id}`}>
              <div className="flex justify-between">
                <span>{item.name}</span>
                <span>優先度: {item.priority}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 開発フロー

1. **models/ にデータアクセス関数を追加**
   - Supabaseとのやり取りを行う関数を実装
   - データの型定義とバリデーションルールを定義

2. **routes/ にルートを追加**
   - URLパスに対応するルートファイルを作成
   - `loader`関数で必要なデータを取得（models/から呼び出し）
   - `action`関数でデータ更新処理を実行（models/から呼び出し）

3. **components/ にUIコンポーネントを追加**
   - ルートから渡されたデータを表示するコンポーネントを実装
   - ユーザー入力を処理するフォームコンポーネントを実装

## 拡張・保守のガイドライン

- 新機能を追加する際は、まずmodelsにビジネスロジックを実装し、次にroutesで呼び出し、最後にUIを実装する
- サーバーサイドでのみ実行される処理は必ず`.server.ts`サフィックスを付けたファイルに配置する
- コンポーネントは純粋なUIに集中し、データアクセスロジックを含めない