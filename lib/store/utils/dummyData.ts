import { Book, Material, ProjectFile } from '../types';

export const generateDummyBooks = (): Book[] => {
  const emojis = ['📚', '✍️', '📖', '📝', '📄', '📓', '📔', '📕', '📗', '📘', '📙', '📋'];
  const titles = [
    '夏の思い出',
    '都市の風景',
    '料理レシピ集',
    '旅行記録',
    '読書ノート',
    'プロジェクト企画',
    '日常エッセイ',
    '創作物語',
    '学習ノート',
    '会議メモ',
    'アイデア帳',
    '写真日記'
  ];

  const books = Array.from({ length: 12 }, (_, i) => {
    const mainFile: ProjectFile = {
      id: `file-${i + 1}-main`,
      title: `${titles[i]}.txt`,
      content: `# ${titles[i]}\n\nここに本文を入力してください...\n\n## メモ\n- アイデア1\n- アイデア2`,
      createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    };

    const memoFile: ProjectFile = {
      id: `file-${i + 1}-memo`,
      title: `${titles[i]}_メモ.txt`,
      content: `# ${titles[i]}のメモ\n\n参考資料や思いついたことを記録します。\n\n- キーワード: ${titles[i]}\n- 重要度: ★★★`,
      createdAt: Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000
    };

    return {
      id: `book-${i + 1}`,
      title: titles[i],
      coverEmoji: emojis[i],
      updatedAt: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
      sourceCount: 2,
      archived: false,
      content: `<h1>${titles[i]}</h1><p>ここに本文を入力してください...</p>`,
      files: [mainFile, memoFile],
      activeFileId: mainFile.id
    } satisfies Book;
  });

  const testProject: Book = {
    id: 'sample_project',
    title: 'サンプルプロジェクト',
    coverEmoji: '🚀',
    updatedAt: Date.now(),
    sourceCount: 3,
    archived: false,
    content: '<h1>サンプルプロジェクト</h1><p>バックエンドテスト用のプロジェクト</p>',
    files: [
      {
        id: 'chapter1',
        title: 'chapter1.txt',
        content: '第1章: 旅立ち\n\n太郎の冒険が始まります...',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000
      },
      {
        id: 'chapter2',
        title: 'chapter2.txt',
        content: '第2章: 出会い\n\n森で魔法使いに出会います...',
        createdAt: Date.now() - 43200000,
        updatedAt: Date.now() - 43200000
      },
      {
        id: 'chapter3',
        title: 'chapter3.txt',
        content: '第3章: 試練\n\n龍の洞窟への挑戦...',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ],
    activeFileId: 'chapter1'
  };

  return [...books, testProject];
};

export const generateDummyMaterials = (): Record<string, Material[]> => {
  const sampleBookMaterials: Material[] = [
    {
      id: 'edo-period-life',
      title: 'edo_period_life.md',
      content: '江戸時代の暮らしについての資料内容...',
      createdAt: Date.now() - 172800000
    },
    {
      id: 'fantasy-worldbuilding',
      title: 'fantasy_worldbuilding.md',
      content: 'ファンタジー世界構築のヒント...',
      createdAt: Date.now() - 86400000
    },
    {
      id: 'japanese-legends',
      title: 'japanese_legends.md',
      content: '日本の伝説と民話について...',
      createdAt: Date.now() - 43200000
    }
  ];

  return {
    sample_book: sampleBookMaterials
  };
};
