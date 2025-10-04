import React, { useState, useEffect } from 'react';
import { Save, FileText, Tag, Trash2, GitBranch, Search, Mic } from 'lucide-react';
import { Note } from '../types';
import { StorageService } from '../services/storage';
import { AIService } from '../services/ai';
import { KnowledgeConverterService } from '../services/knowledgeConverter';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { MindMap } from './MindMap';
import { LiteratureSearch } from './LiteratureSearch';
import { SpeechToText } from './SpeechToText';

interface NoteEditorProps {
  note?: Note;
  onSave?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  onClose?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  const [showLiterature, setShowLiterature] = useState(false);
  const [showSpeechToText, setShowSpeechToText] = useState(false);
  const [apiKey] = useLocalStorage('ai_api_key', '');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    
    try {
      const autoTags = AIService.extractTags(content);
      const allTags = [...new Set([...tags, ...autoTags])];

      const savedNote: Note = {
        id: note?.id || uuidv4(),
        title: title.trim() || content.substring(0, 30) + '...',
        content: content.trim(),
        tags: allTags,
        createdAt: note?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      StorageService.saveNote(savedNote);
      
      await KnowledgeConverterService.autoConvertNote(savedNote, apiKey);
      
      onSave?.(savedNote);
      
      if (!note) {
        setTitle('');
        setContent('');
        setTags([]);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (note && window.confirm('确定要删除这篇笔记吗？')) {
      StorageService.deleteNote(note.id);
      onDelete?.(note.id);
      onClose?.();
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newTag = e.currentTarget.value.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h2 className="text-lg font-semibold">
            {note ? '编辑笔记' : '新建笔记'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSpeechToText(!showSpeechToText)}
            className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-1"
          >
            <Mic className="w-4 h-4" />
            {showSpeechToText ? '隐藏语音' : '语音输入'}
          </button>
          {content.trim() && (
            <>
              <button
                onClick={() => setShowLiterature(!showLiterature)}
                className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                {showLiterature ? '隐藏文献' : '搜索文献'}
              </button>
              <button
                onClick={() => setShowMindMap(!showMindMap)}
                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
              >
                <GitBranch className="w-4 h-4" />
                {showMindMap ? '隐藏思维导图' : '生成思维导图'}
              </button>
            </>
          )}
          {note && (
            <button
              onClick={handleDelete}
              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || (!title.trim() && !content.trim())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {showSpeechToText ? (
          <div className="p-4 h-full overflow-auto">
            <SpeechToText
              onInsertText={(text) => {
                setContent(prev => prev + (prev ? '\n\n' : '') + text);
                setShowSpeechToText(false);
              }}
            />
          </div>
        ) : showLiterature ? (
          <LiteratureSearch
            content={content}
            onClose={() => setShowLiterature(false)}
          />
        ) : showMindMap ? (
          <MindMap
            content={content}
            onClose={() => setShowMindMap(false)}
          />
        ) : (
          <div className="p-4 space-y-4 h-full overflow-auto">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入笔记标题..."
              className="w-full text-xl font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">标签</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyPress={handleAddTag}
                placeholder="添加标签，按回车确认"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始记录您的想法..."
              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            {note && (
              <div className="text-sm text-gray-500">
                <p>创建时间: {note.createdAt.toLocaleString()}</p>
                <p>更新时间: {note.updatedAt.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};