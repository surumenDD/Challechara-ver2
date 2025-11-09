import { Material } from "@/lib/store";
import { extractText } from "@/lib/file";

/**
 * ファイルから資料を追加する関数
 * @param file - アップロードする.txtファイル
 * @param bookId - 書籍ID（バックエンドの数値ID、文字列形式）
 * @returns 作成されたMaterial
 */
export async function addMaterialFromFile(
    file: File,
    bookId: string
): Promise<Material> {
    // ファイル名から拡張子を除いたものをtitleとして使用
    const title = file.name.replace(/\.[^/.]+$/, '');

    // ファイル内容を読み込む
    const content = await extractText(file);

    // バックエンドAPIに送信（ポート8080を使用）
    const response = await fetch(`http://localhost:8080/api/books/${bookId}/materials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to add materials: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
}