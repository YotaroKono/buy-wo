import { load } from 'cheerio';

type ScrapedProductData = {
  imageUrl: string | null;
  title: string | null;
  price: string | null;
};

/**
 * 商品ページのURLから画像URLを取得する
 */
export async function scrapeProductImage(url: string): Promise<ScrapedProductData> {
  try {
    // fetch APIを使用してページのHTMLを取得
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Cheerioでパース
    const $ = load(html);
    
    // サイトごとに画像セレクタを変更する必要があります
    let imageUrl: string | null = null;
    let title: string | null = null;
    let price: string | null = null;

    // Amazonの場合
    if (url.includes('amazon')) {
      // undefinedをnullに変換するため、nullishコアレッシング演算子を使用
      imageUrl = $('#landingImage').attr('src') ?? 
                $('#imgBlkFront').attr('src') ?? 
                $('.a-dynamic-image').attr('src') ?? 
                null;
      title = $('#productTitle').text().trim() || null;
      price = $('.a-offscreen').first().text().trim() || null;
    }
    // 楽天の場合
    else if (url.includes('rakuten')) {
      imageUrl = $('meta[property="og:image"]').attr('content') ?? null;
      title = $('meta[property="og:title"]').attr('content') ?? null;
      price = $('.price').text().trim() || null;
    }
    // その他の一般的なECサイトの場合
    else {
      // オープングラフタグから画像を取得（多くのサイトで使用されている）
      imageUrl = $('meta[property="og:image"]').attr('content') ?? null;
      
      // それでも見つからない場合は一般的な商品画像のパターンを試す
      if (!imageUrl) {
        imageUrl = $('.product-image img').attr('src') ??
                  $('.main-image img').attr('src') ??
                  $('.product-main-image img').attr('src') ??
                  null;
      }
      
      title = $('meta[property="og:title"]').attr('content') ?? 
              ($('h1').first().text().trim() || null);
      
      price = $('.price').text().trim() ||
              $('.product-price').text().trim() ||
              null;
    }

    return { imageUrl, title, price };
  } catch (error) {
    console.error('Product page scraping failed:', error);
    return { imageUrl: null, title: null, price: null };
  }
}