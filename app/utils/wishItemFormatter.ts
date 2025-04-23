export function getPriorityClass(priority: string | null): string {
  switch (priority) {
    case 'high': return 'badge-error';
    case 'middle': return 'badge-warning';
    case 'low': return 'badge-info';
    default: return 'badge-ghost';
  }
}

export function getPriorityLabel(priority: string | null): string {
  switch (priority) {
    case 'high': return '高';
    case 'middle': return '中';
    case 'low': return '低';
    default: return '未設定';
  }
}

export function getStatusLabel(status: string | null): string {
  switch (status) {
    case 'purchased': return '購入済み';
    case 'unpurchased': return '未購入';
    default: return '未設定';
  }
}

export function formatPrice(price: number | null, currency: string | null | undefined = 'JPY'): string {
  // 価格フォーマットのロジック（既存のコードを移動）
  if (!price) return '';
  
  // 以下、既存のコードを移動
  const currencyCode = currency || 'JPY';
  
  const formatOptions: Record<string, { locale: string, options: Intl.NumberFormatOptions }> = {
    'JPY': {
      locale: 'ja-JP',
      options: {
        style: 'currency',
        currency: 'JPY',
        currencyDisplay: 'symbol',
      },
    },
    'USD': {
      locale: 'en-US',
      options: {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol',
      },
    },
  };
  
  const format = formatOptions[currencyCode] || {
    locale: 'ja-JP',
    options: { style: 'currency', currency: currencyCode },
  };
  
  return new Intl.NumberFormat(format.locale, format.options).format(price);
}