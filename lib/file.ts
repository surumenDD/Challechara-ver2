// ダミーテキスト抽出
export async function extractText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // ファイル名 + 先頭数百文字のダミー
      const preview = result ? result.substring(0, 300) : '';
      resolve(`ファイル名: ${file.name}\n\n${preview}${result && result.length > 300 ? '...' : ''}\n\n（実際のファイルからのテキスト抽出はダミー実装です）`);
    };
    reader.readAsText(file);
  });
}

// TXTエクスポート（LF改行、UTF-8）
export function exportAsTxt(filename: string, content: string) {
  // HTMLタグを除去
  const plainText = content
    .replace(/<ruby><rb>(.*?)<\/rb><rt>(.*?)<\/rt><\/ruby>/g, '$1($2)')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  
  // LF改行に統一
  const normalizedContent = plainText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const blob = new Blob([normalizedContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ファイルサイズのフォーマット
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 日付フォーマット
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

// 相対時間フォーマット
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}日前`;
  } else if (hours > 0) {
    return `${hours}時間前`;
  } else if (minutes > 0) {
    return `${minutes}分前`;
  } else {
    return '今';
  }
}