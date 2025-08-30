import { test, expect } from '@playwright/test';

test.describe('エディタ画面', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用のブックIDで画面にアクセス
    await page.goto('/book/book-1');
    
    // ページの読み込み待ち
    await expect(page.locator('h1')).toContainText('三分割エディタ');
  });

  test('左で選択→検索→左チャットへ→モック応答表示', async ({ page }) => {
    // ソース管理タブがアクティブであることを確認
    await expect(page.locator('.tab-button.active')).toContainText('ソース管理');
    
    // ファイルアップロード（ダミーデータがない場合の準備）
    // 実際の環境では LocalStorage にダミーデータが入っているはず
    
    // 既存のソースがある場合の処理をテスト
    const sourceItems = page.locator('[data-testid="source-item"]');
    const sourceCount = await sourceItems.count();
    
    if (sourceCount > 0) {
      // 最初のソースを選択
      await sourceItems.first().click();
      
      // 選択されたことを確認
      await expect(sourceItems.first().locator('input[type="checkbox"]')).toBeChecked();
      
      // 検索ボタンをクリック
      await page.locator('button:has-text("検索")').click();
      
      // ソースチャットタブに切り替わることを確認
      await expect(page.locator('.tab-button.active')).toContainText('ソースチャット');
      
      // 選択されたソースのチップが表示されることを確認
      await expect(page.locator('.chip')).toBeVisible();
      
      // チャットメッセージを送信
      const messageInput = page.locator('textarea[placeholder*="質問する"]');
      await messageInput.fill('このソースについて教えてください');
      await page.locator('button[title*="送信"]').click();
      
      // ユーザーメッセージが表示されることを確認
      await expect(page.locator('.chat-message.user')).toContainText('このソースについて教えてください');
      
      // モック応答が表示されるまで待機
      await expect(page.locator('.chat-message.assistant')).toBeVisible({ timeout: 3000 });
      
      // モック応答の内容を確認
      const assistantMessage = page.locator('.chat-message.assistant').last();
      await expect(assistantMessage).toContainText('参照されたソース');
    } else {
      // ソースがない場合はテストをスキップ
      test.skip(true, "テスト用のソースデータがありません");
    }
  });

  test('エディタ機能の基本動作', async ({ page }) => {
    // タイトル入力
    const titleInput = page.locator('input[placeholder*="タイトル"]');
    await titleInput.clear();
    await titleInput.fill('テスト用タイトル');
    
    // エディタにテキストを入力
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.clear();
    await editor.fill('これはテスト用の本文です。');
    
    // 文字数カウンタが表示されることを確認
    await expect(page.locator('text=文字')).toBeVisible();
    
    // ツールバーの基本機能をテスト
    await editor.selectText();
    await page.locator('button[title*="太字"]').click();
    
    // 保存インジケータが表示されることを確認
    await expect(page.locator('text=保存')).toBeVisible();
  });

  test('右パネルのタブ切り替え', async ({ page }) => {
    // 辞書・表現検索タブ
    await page.locator('button:has-text("辞書・表現検索")').click();
    await expect(page.locator('input[placeholder*="検索"]')).toBeVisible();
    
    // 資料検索タブ
    await page.locator('button:has-text("資料検索")').click();
    
    // 資料アップロードタブ
    await page.locator('button:has-text("資料アップロード")').click();
    await expect(page.locator('text=資料をアップロード')).toBeVisible();
    
    // 資料チャットタブ
    await page.locator('button:has-text("資料チャット")').click();
    await expect(page.locator('textarea[placeholder*="資料について"]')).toBeVisible();
  });

  test('レスポンシブ対応', async ({ page }) => {
    // デスクトップサイズで3ペインが表示されることを確認
    await page.setViewportSize({ width: 1400, height: 800 });
    await expect(page.locator('.ProseMirror')).toBeVisible();
    
    // タブレットサイズでレイアウトが変わることを確認
    await page.setViewportSize({ width: 900, height: 600 });
    await expect(page.locator('button[title*="メニュー"]')).toBeVisible();
    
    // モバイルサイズでアコーディオン表示になることを確認
    await page.setViewportSize({ width: 500, height: 600 });
    await expect(page.locator('.mobile-accordion')).toBeVisible();
  });
});