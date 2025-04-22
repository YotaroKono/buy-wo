// キャッシュのインターフェース
interface SignedUrlCache {
    [key: string]: {
      url: string;
      expiresAt: number; // Unixタイムスタンプ（ミリ秒）
    };
}
  
// グローバルキャッシュオブジェクト
const signedUrlCache: SignedUrlCache = {};
  
// キャッシュ管理ユーティリティ
function getFromCache(path: string): string | null {
    const cached = signedUrlCache[path];
    if (!cached) return null;
    
    // 現在時刻（ミリ秒）
    const now = Date.now();
    
    // キャッシュが有効期限切れかチェック
    if (now > cached.expiresAt) {
      // 期限切れならキャッシュを削除
      delete signedUrlCache[path];
      return null;
    }
    
    return cached.url;
}
  
function addToCache(path: string, url: string, expiresIn: number): void {
    // 現在時刻 + 有効期間（秒をミリ秒に変換）
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    signedUrlCache[path] = {
      url,
      expiresAt
    };
}
  
// キャッシュ対応の署名付きURL生成
export async function getSignedUrl(
    supabase: any, 
    path: string, 
    expiresIn: number = 3600 // デフォルト1時間
  ): Promise<string | null> {
    // まずキャッシュをチェック
    const cachedUrl = getFromCache(path);
    if (cachedUrl) {
      return cachedUrl;
    }
    
    // キャッシュになければ新しく生成
    const { data, error } = await supabase.storage
      .from("wish-item-images")
      .createSignedUrl(path, expiresIn);
    
    if (error || !data) {
      console.error("Error generating signed URL:", error);
      return null;
    }
    
    // キャッシュに追加して返す
    // 少し早めに期限切れにするため、10分短く設定
    const cacheExpiresIn = Math.max(expiresIn - 600, 60); // 最低でも1分はキャッシュ
    addToCache(path, data.signedUrl, cacheExpiresIn);
    
    return data.signedUrl;
}