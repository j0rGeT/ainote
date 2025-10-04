import React, { useState, useEffect } from 'react';
import { Literature } from '../types';
import { AIService } from '../services/ai';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { Search, BookOpen, Users, Calendar, ExternalLink, Star } from 'lucide-react';

interface LiteratureSearchProps {
  content: string;
  onClose?: () => void;
}

export const LiteratureSearch: React.FC<LiteratureSearchProps> = ({ content, onClose }) => {
  const [literature, setLiterature] = useState<Literature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey] = useLocalStorage('ai_api_key', '');

  useEffect(() => {
    searchLiterature();
  }, [content]);

  const searchLiterature = async () => {
    if (!content.trim()) {
      setError('请先输入内容');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const literatureData = await AIService.searchLiterature(content, apiKey);

      const literatureList: Literature[] = literatureData.map((item: any) => ({
        id: uuidv4(),
        title: item.title,
        authors: item.authors || [],
        abstract: item.abstract,
        publicationDate: item.publicationDate,
        source: item.source,
        url: item.url,
        tags: item.tags || [],
        relevanceScore: item.relevanceScore || 0.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      setLiterature(literatureList);
    } catch (error) {
      console.error('Error searching literature:', error);
      setError('搜索文献时出错');
    } finally {
      setIsSearching(false);
    }
  };

  const handleReSearch = () => {
    searchLiterature();
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getRelevanceText = (score: number) => {
    if (score >= 0.8) return '高度相关';
    if (score >= 0.6) return '中度相关';
    return '一般相关';
  };

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">正在搜索相关文献...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleReSearch}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          重新搜索
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          <h3 className="text-lg font-semibold">相关文献推荐</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReSearch}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            重新搜索
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
            >
              关闭
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {literature.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">点击搜索相关文献</p>
            <button
              onClick={handleReSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              搜索文献
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {literature.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(
                        item.relevanceScore
                      )}`}
                    >
                      <Star className="w-3 h-3 inline mr-1" />
                      {getRelevanceText(item.relevanceScore)}
                    </span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {item.authors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{item.authors.join(', ')}</span>
                    </div>
                  )}

                  {item.publicationDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{item.publicationDate}</span>
                    </div>
                  )}

                  {item.source && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{item.source}</span>
                    </div>
                  )}
                </div>

                {item.abstract && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.abstract}
                    </p>
                  </div>
                )}

                {item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
        <p>💡 提示：基于AI分析为您推荐的相关学术文献</p>
      </div>
    </div>
  );
};