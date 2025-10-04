import { ChatMessage } from '../types';

export class AIService {
  private static readonly API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  static async sendMessage(messages: ChatMessage[], apiKey?: string): Promise<string> {
    if (!apiKey) {
      return "请在设置中配置 AI API Key 以使用问答功能。";
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI service error:', error);
      return "抱歉，AI 服务暂时不可用。请检查网络连接和 API 配置。";
    }
  }

  static async generateSummary(content: string, apiKey?: string): Promise<string> {
    if (!apiKey) {
      return this.extractFirstSentence(content);
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '请用中文为以下内容生成一个简洁的摘要，不超过100字。'
            },
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.3,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Summary generation error:', error);
      return this.extractFirstSentence(content);
    }
  }

  private static extractFirstSentence(content: string): string {
    const sentences = content.split(/[。！？.!?]/);
    return sentences[0].substring(0, 100) + (content.length > 100 ? '...' : '');
  }

  static extractTags(content: string): string[] {
    const words = content.toLowerCase().match(/[\u4e00-\u9fa5a-zA-Z]+/g) || [];
    const commonWords = new Set(['的', '是', '在', '有', '和', '了', '我', '你', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

    const wordCount = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 1 && !commonWords.has(word)) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  static async generateMindMap(content: string, apiKey?: string): Promise<any> {
    if (!apiKey) {
      return this.generateSimpleMindMap(content);
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `请分析以下内容并生成一个思维导图结构。返回格式必须是严格的JSON格式：
{
  "title": "思维导图标题",
  "root": {
    "name": "中心主题",
    "children": [
      {
        "name": "主要分支1",
        "children": [
          {"name": "子分支1"},
          {"name": "子分支2"}
        ]
      },
      {
        "name": "主要分支2",
        "children": [
          {"name": "子分支3"},
          {"name": "子分支4"}
        ]
      }
    ]
  }
}
请确保返回的是有效的JSON，不要包含其他文本。`
            },
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const mindMapData = JSON.parse(data.choices[0].message.content);
      return mindMapData;
    } catch (error) {
      console.error('Mind map generation error:', error);
      return this.generateSimpleMindMap(content);
    }
  }

  private static generateSimpleMindMap(content: string): any {
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    const mainTopics = sentences.slice(0, 3);

    return {
      title: '内容思维导图',
      root: {
        name: '中心主题',
        children: mainTopics.map((topic) => ({
          name: topic.substring(0, 20) + (topic.length > 20 ? '...' : ''),
          children: []
        }))
      }
    };
  }

  static async searchLiterature(content: string, apiKey?: string): Promise<any[]> {
    if (!apiKey) {
      return this.generateMockLiterature(content);
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `基于用户提供的内容，生成相关的学术文献推荐。返回格式必须是严格的JSON数组格式：
[
  {
    "title": "文献标题",
    "authors": ["作者1", "作者2"],
    "abstract": "文献摘要",
    "publicationDate": "2023-01-01",
    "source": "期刊/会议名称",
    "url": "文献链接（可选）",
    "tags": ["标签1", "标签2"],
    "relevanceScore": 0.85
  }
]
请生成3-5个相关的文献推荐，确保返回的是有效的JSON数组，不要包含其他文本。`
            },
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.5,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const literatureData = JSON.parse(data.choices[0].message.content);
      return literatureData;
    } catch (error) {
      console.error('Literature search error:', error);
      return this.generateMockLiterature(content);
    }
  }

  private static generateMockLiterature(content: string): any[] {
    const keywords = this.extractTags(content);
    const mockLiterature = [
      {
        title: `关于${keywords[0] || '相关主题'}的研究综述`,
        authors: ['张三', '李四'],
        abstract: '本文系统性地综述了相关领域的研究进展和未来发展方向。',
        publicationDate: '2023-06-15',
        source: '计算机科学学报',
        url: 'https://example.com/paper1',
        tags: keywords.slice(0, 3),
        relevanceScore: 0.92
      },
      {
        title: `${keywords[1] || '关键技术'}的最新进展`,
        authors: ['王五', '赵六'],
        abstract: '本文详细介绍了相关技术的最新研究成果和应用案例。',
        publicationDate: '2023-03-20',
        source: '人工智能研究',
        tags: keywords.slice(1, 4),
        relevanceScore: 0.85
      },
      {
        title: `基于${keywords[2] || '现代方法'}的应用研究`,
        authors: ['钱七', '孙八'],
        abstract: '本文探讨了相关方法在实际应用中的效果和优化方案。',
        publicationDate: '2023-09-10',
        source: '软件工程',
        tags: keywords.slice(2, 5),
        relevanceScore: 0.78
      }
    ];

    return mockLiterature;
  }
}