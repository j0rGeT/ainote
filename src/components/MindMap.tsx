import React, { useState, useEffect } from 'react';
import { MindMap as MindMapType, MindMapNode } from '../types';
import { AIService } from '../services/ai';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

interface MindMapProps {
  content: string;
  onClose?: () => void;
}

interface TreeNodeProps {
  node: MindMapNode;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = node.children && node.children.length > 0;

  const colors = [
    'bg-blue-100 border-blue-300',
    'bg-green-100 border-green-300',
    'bg-purple-100 border-purple-300',
    'bg-orange-100 border-orange-300',
    'bg-pink-100 border-pink-300',
    'bg-indigo-100 border-indigo-300',
  ];

  const colorClass = colors[depth % colors.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md ${colorClass}`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        style={{
          cursor: hasChildren ? 'pointer' : 'default',
          minWidth: '120px',
          maxWidth: '200px',
          wordWrap: 'break-word',
        }}
      >
        {node.name}
        {hasChildren && (
          <span className="ml-2 text-xs opacity-70">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 flex flex-col items-center">
          <div className="w-0.5 h-4 bg-gray-300"></div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {node.children!.map((child, index) => (
              <div key={child.id || index} className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-gray-300"></div>
                <TreeNode node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const MindMap: React.FC<MindMapProps> = ({ content, onClose }) => {
  const [mindMap, setMindMap] = useState<MindMapType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey] = useLocalStorage('ai_api_key', '');

  useEffect(() => {
    generateMindMap();
  }, [content]);

  const generateMindMap = async () => {
    if (!content.trim()) {
      setError('请先输入内容');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const mindMapData = await AIService.generateMindMap(content, apiKey);

      const addIds = (node: any): MindMapNode => ({
        id: uuidv4(),
        name: node.name,
        children: node.children ? node.children.map(addIds) : undefined
      });

      const mindMap: MindMapType = {
        id: uuidv4(),
        title: mindMapData.title || '思维导图',
        root: addIds(mindMapData.root),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMindMap(mindMap);
    } catch (error) {
      console.error('Error generating mind map:', error);
      setError('生成思维导图时出错');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    generateMindMap();
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">正在生成思维导图...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRegenerate}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          重新生成
        </button>
      </div>
    );
  }

  if (!mindMap) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">点击生成思维导图</p>
        <button
          onClick={handleRegenerate}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          生成思维导图
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">{mindMap.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            重新生成
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

      <div className="flex-1 p-8 overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex justify-center">
          <TreeNode node={mindMap.root} depth={0} />
        </div>
      </div>

      <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
        <p>💡 提示：点击节点可以展开/收起子节点</p>
      </div>
    </div>
  );
};