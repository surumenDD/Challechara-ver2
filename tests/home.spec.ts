import { test, expect } from '@playwright/test';

test.describe('ホーム画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // ページの読み込み待ち
    await expect(page.locator('h1,span').filter({ hasText: 'マイブック' })).toBeVisible();
  });

  test('初期状態の確認', async ({ page }) => {
    // ヘッダーにマイブックが表示されることを確認
    await expect(page.locator('text=マイブック')).toBeVisible();
    
    // 12件のダミーブック + 新規作成カードが表示されることを確認
    const cards = page.locator('[data-testid="book-card"], .border-dashed');
    await expect(cards).toHaveCount(13); // 12件のブック + 1件の新規作成カード
    
    // グリッド表示がデフォルトであることを確認
    await expect(page.locator('button[title="グリッド表示"]')).toHaveClass(/primary/);
  });

  test('Grid/List切替→検索→新規作成→カードクリックで遷移', async ({ page }) => {
    // Grid/List表示切替
    await page.locator('button[title="リスト表示"]').click();
    await expect(page.locator('button[title="リスト表示"]')).toHaveClass(/primary/);
    
    // リスト表示になることを確認
    await expect(page.locator('text=タイトル').first()).toBeVisible();
    
    // グリッド表示に戻す
    await page.locator('button[title="グリッド表示"]').click();
    await expect(page.locator('button[title="グリッド表示"]')).toHaveClass(/primary/);
    
    // 検索機能をテスト
    const searchInput = page.locator('input[placeholder*="検索"]');
    await searchInput.fill('夏');
    
    // 検索結果が絞り込まれることを確認（デバウンス待ち）
    await page.waitForTimeout(300);
    const visibleCards = page.locator('[data-testid="book-card"]:visible');
    const cardCount = await visibleCards.count();
    expect(cardCount).toBeLessThan(12); // 全件より少なくなる
    
    // 検索をクリア
    await searchInput.clear();
    await page.waitForTimeout(300);
    
    // 新規作成をテスト
    await page.locator('button:has-text("新規作成")').click();
    
    // ダイアログが表示されることを確認
    await expect(page.locator('text=新しいブックを作成')).toBeVisible();
    
    // タイトルを入力
    await page.locator('input[placeholder*="タイトル"]').fill('テスト用ブック');
    
    // 作成ボタンをクリック
    await page.locator('button:has-text("作成")').click();
    
    // エディタページに遷移することを確認
    await expect(page.locator('h1').filter({ hasText: '三分割エディタ' })).toBeVisible();
    
    // ホームに戻る
    await page.locator('a[href="/"]').click();
    
    // 作成したブックが表示されることを確認
    await expect(page.locator('text=テスト用ブック')).toBeVisible();
    
    // ブックカードをクリックして遷移
    await page.locator('text=テスト用ブック').click();
    
    // エディタページに遷移することを確認
    await expect(page.locator('h1').filter({ hasText: '三分割エディタ' })).toBeVisible();
  });

  test('ブック操作メニュー', async ({ page }) => {
    // 最初のブックカードのメニューボタンをクリック
    const firstCard = page.locator('[data-testid="book-card"]').first();
    await firstCard.hover();
    
    const menuButton = firstCard.locator('button').first();
    await menuButton.click();
    
    // コンテキストメニューが表示されることを確認
    await expect(page.locator('text=開く')).toBeVisible();
    await expect(page.locator('text=名前変更')).toBeVisible();
    await expect(page.locator('text=複製')).toBeVisible();
    await expect(page.locator('text=エクスポート')).toBeVisible();
    await expect(page.locator('text=削除')).toBeVisible();
    
    // 複製をテスト
    await page.locator('text=複製').click();
    
    // 複製されたブックが表示されることを確認
    await expect(page.locator('text=コピー')).toBeVisible();
    
    // 外側をクリックしてメニューを閉じる
    await page.locator('body').click();
  });

  test('並び替え機能', async ({ page }) => {
    // 並び替えボタンをクリック
    await page.locator('button:has(text("新しい順"))').click();
    
    // 並び替えメニューが表示されることを確認
    await expect(page.locator('text=古い順')).toBeVisible();
    await expect(page.locator('text=タイトル A→Z')).toBeVisible();
    await expect(page.locator('text=タイトル Z→A')).toBeVisible();
    
    // タイトル A→Z を選択
    await page.locator('text=タイトル A→Z').click();
    
    // ボタンのテキストが変更されることを確認
    await expect(page.locator('button:has(text("タイトル A→Z"))').first()).toBeVisible();
  });

  test('キーボードショートカット', async ({ page }) => {
    // "/" キーで検索フォーカス
    await page.keyboard.press('/');
    
    // 検索入力がフォーカスされることを確認
    const searchInput = page.locator('input[placeholder*="検索"]');
    await expect(searchInput).toBeFocused();
    
    // ESCでフォーカス解除（実装されている場合）
    await page.keyboard.press('Escape');
  });

  test('EmptyState表示', async ({ page }) => {
    // 存在しない検索語で検索
    const searchInput = page.locator('input[placeholder*="検索"]');
    await searchInput.fill('存在しないブック名123456');
    await page.waitForTimeout(300);
    
    // EmptyStateが表示されることを確認
    await expect(page.locator('text=検索結果が見つかりません')).toBeVisible();
    await expect(page.locator('text=別のキーワードで検索してみてください')).toBeVisible();
  });
});