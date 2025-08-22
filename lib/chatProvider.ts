import { ChatMessage } from './store';

export interface ChatProvider {
  send(messages: ChatMessage[], opts?: { sources?: string[] }): Promise<ChatMessage>;
}

export class MockProvider implements ChatProvider {
  async send(messages: ChatMessage[], { sources = [] } = {}): Promise<ChatMessage> {
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

export class OpenAIProvider implements ChatProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async send(messages: ChatMessage[], { sources = [] } = {}): Promise<ChatMessage> {
    // 実装は空でも可とのことなので、とりあえずMockProviderと同じ動作
    const mockProvider = new MockProvider();
    const response = await mockProvider.send(messages, { sources });
    return {
      ...response,
      content: '(OpenAI) ' + response.content
    };
  }
}

// プロバイダーファクトリー
export function createChatProvider(): ChatProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (apiKey) {
    return new OpenAIProvider(apiKey);
  } else {
    return new MockProvider();
  }
}

export const chatProvider = createChatProvider();