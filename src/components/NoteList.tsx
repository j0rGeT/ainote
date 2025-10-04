import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Calendar, Tag } from 'lucide-react';
import { Note } from '../types';
import { StorageService } from '../services/storage';
import { format } from 'date-fns';

interface NoteListProps {
  onNoteSelect: (note: Note) => void;
  onNewNote: () => void;
  selectedNoteId?: string;
  refreshTrigger?: number;
}

export const NoteList: React.FC<NoteListProps> = ({ 
  onNoteSelect, 
  onNewNote, 
  selectedNoteId,
  refreshTrigger 
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    loadNotes();
  }, [refreshTrigger]);

  const loadNotes = () => {
    const loadedNotes = StorageService.getNotes();
    setNotes(loadedNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === '' || note.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            我的笔记
          </h2>
          <button
            onClick={onNewNote}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索笔记..."
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
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm || selectedTag ? (
              <div>
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>没有找到匹配的笔记</p>
              </div>
            ) : (
              <div>
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>还没有笔记</p>
                <p className="text-sm mt-2">点击"新建"开始记录想法</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onNoteSelect(note)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedNoteId === note.id 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {note.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {note.content}
                </p>
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(note.updatedAt, 'MM-dd HH:mm')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};