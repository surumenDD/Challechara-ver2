import { ChatMessage } from './store';

export interface ChatProvider {
  send(messages: ChatMessage[], opts?: { sources?: string[], chatType?: string }): Promise<ChatMessage>;
}

export class MockProvider implements ChatProvider {
  async send(messages: ChatMessage[], opts?: { sources?: string[], chatType?: string }): Promise<ChatMessage> {
    const { sources = [], chatType = 'general' } = opts || {};
    
    // 1秒待機でリアル感を演出
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lastMessage = messages[messages.length - 1];
    let mockResponse = '';
    
    if (sources.length > 0) {
      mockResponse = `参照されたソース（${sources.slice(0, 3).join('、')}${sources.length > 3 ? `他${sources.length - 3}件` : ''}）に基づいて回答します。\n\n`;
    }
    
    // 簡単なパターンマッチング
    const content = lastMessage.content.toLowerCase();
    if (content.includes('検索') || content.includes('探し')) {
      mockResponse += 'こちらの検索結果をご確認ください。より詳細な情報が必要でしたら、具体的なキーワードをお教えください。';
    } else if (content.includes('書き方') || content.includes('表現')) {
      mockResponse += 'この表現について、いくつかのバリエーションをご提案します。文脈に応じて適切なものをお選びください。';
    } else if (content.includes('資料') || content.includes('情報')) {
      mockResponse += '提供された資料から関連する情報を抽出しました。詳細については該当箇所をご参照ください。';
    } else {
      mockResponse += 'ご質問ありがとうございます。AIアシスタントとして、最適な回答をご提供するよう努めます。';
    }
    
    return {
      id: crypto.randomUUID?.() || String(Date.now()),
      role: 'assistant',
      ts: Date.now(),
      content: mockResponse
    };
  }
}

export class APIProvider implements ChatProvider {
  private baseURL: string;
  
  constructor(baseURL: string = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
  }
  
  async send(messages: ChatMessage[], opts: { sources?: string[], chatType?: string } = {}): Promise<ChatMessage> {
    const { sources = [], chatType = 'project' } = opts;
    
    // チャット種別に応じてエンドポイントを決定
    const endpoint = {
      'project': '/chat/project',
      'dictionary': '/chat/dictionary', 
      'material': '/chat/material'
    }[chatType] || '/chat/project';
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          sources
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.message;
      
    } catch (error) {
      console.error('API Provider error:', error);
      // エラー時はMockProviderにフォールバック
      const mockProvider = new MockProvider();
      return await mockProvider.send(messages, { sources, chatType });
    }
  }
}

export class OpenAIProvider implements ChatProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async send(messages: ChatMessage[], opts?: { sources?: string[], chatType?: string }): Promise<ChatMessage> {
    const { sources = [], chatType = 'general' } = opts || {};
    
    // 実装は空でも可とのことなので、とりあえずMockProviderと同じ動作
    const mockProvider = new MockProvider();
    const response = await mockProvider.send(messages, { sources, chatType });
    return {
      ...response,
      content: '(OpenAI) ' + response.content
    };
  }
}

// プロバイダーファクトリー
export function createChatProvider(): ChatProvider {
  // 本番環境かどうかを判定（環境変数またはホスト名で判定）
  const isProduction = typeof window !== 'undefined' && 
    (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
  
  // API使用環境の場合はAPIProvider、テスト環境ではMockProvider
  if (!isProduction || typeof window !== 'undefined') {
    return new APIProvider();
  } else {
    return new MockProvider();
  }
}

export const chatProvider = createChatProvider();