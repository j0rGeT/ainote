import React, { useState, useEffect } from 'react';
import { Search, Book, Tag, Calendar, ExternalLink } from 'lucide-react';
import { KnowledgeItem } from '../types';
import { StorageService } from '../services/storage';
import { format } from 'date-fns';

interface KnowledgeBaseProps {
  refreshTrigger?: number;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ refreshTrigger }) => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  useEffect(() => {
    loadKnowledgeItems();
  }, [refreshTrigger]);

  const loadKnowledgeItems = () => {
    const items = StorageService.getKnowledgeItems();
    setKnowledgeItems(items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  };

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === '' || item.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(knowledgeItems.flatMap(item => item.tags)));

  const findSourceNote = (noteId?: string) => {
    if (!noteId) return null;
    const notes = StorageService.getNotes();
    return notes.find(note => note.id === noteId);
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Book className="w-5 h-5" />
            知识库
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索知识..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {allTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">标签筛选</span>
              </div>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有标签</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm || selectedTag ? (
                <div>
                  <Book className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>没有找到匹配的知识</p>
                </div>
              ) : (
                <div>
                  <Book className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>知识库为空</p>
                  <p className="text-sm mt-2">保存笔记后会自动生成知识条目</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === item.id 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {item.summary}
                  </p>
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(item.updatedAt, 'MM-dd HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedItem ? (
          <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedItem.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    创建于 {format(selectedItem.createdAt, 'yyyy-MM-dd HH:mm')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    更新于 {format(selectedItem.updatedAt, 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>
              </div>

              {selectedItem.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">摘要</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedItem.summary}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">详细内容</h3>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 bg-white p-4 border border-gray-200 rounded-lg">
                    {selectedItem.content}
                  </div>
                </div>
              </div>

              {selectedItem.sourceNoteId && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">来源笔记</h3>
                  <div className="flex items-center gap-2 text-blue-600">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">
                      来自笔记: {findSourceNote(selectedItem.sourceNoteId)?.title || '已删除的笔记'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Book className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">选择一个知识条目查看详情</p>
              <p className="text-sm mt-2">点击左侧列表中的任意条目</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};