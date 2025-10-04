import React, { useState } from 'react';
import { MessageSquare, FileText, Book, ArrowLeft, Menu } from 'lucide-react';
import { useTouch } from '../hooks/useTouch';
import { Chat } from './Chat';
import { NoteEditor } from './NoteEditor';
import { NoteList } from './NoteList';
import { KnowledgeBase } from './KnowledgeBase';
import { Note, ChatSession } from '../types';
import { StorageService } from '../services/storage';

type ActiveTab = 'chat' | 'notes' | 'knowledge';
type MobileView = 'tabs' | 'note-list' | 'note-editor' | 'knowledge-detail';

interface MobileLayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedNote: Note | null;
  setSelectedNote: (note: Note | null) => void;
  currentChatSession: ChatSession | null;
  refreshTrigger: number;
  onNoteSave: (note: Note) => void;
  onNoteDelete: (noteId: string) => void;
  onChatSessionUpdate: (session: ChatSession) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  activeTab,
  setActiveTab,
  selectedNote,
  setSelectedNote,
  currentChatSession,
  refreshTrigger,
  onNoteSave,
  onNoteDelete,
  onChatSessionUpdate
}) => {
  const [mobileView, setMobileView] = useState<MobileView>('tabs');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Touch handlers for swipe navigation
  const touchRef = useTouch<HTMLDivElement>({
    onSwipeLeft: () => {
      if (activeTab === 'notes') setActiveTab('knowledge');
      else if (activeTab === 'knowledge') setActiveTab('chat');
    },
    onSwipeRight: () => {
      if (activeTab === 'chat') setActiveTab('knowledge');
      else if (activeTab === 'knowledge') setActiveTab('notes');
    },
    onSwipeDown: () => {
      if (mobileView !== 'tabs') {
        handleBackToList();
      }
    }
  });

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setMobileView('note-editor');
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setMobileView('note-editor');
  };

  const handleBackToList = () => {
    if (mobileView === 'note-editor') {
      setMobileView('note-list');
      setSelectedNote(null);
    } else {
      setMobileView('tabs');
    }
  };

  const getTabCount = (tab: ActiveTab): number => {
    switch (tab) {
      case 'notes':
        return StorageService.getNotes().length;
      case 'knowledge':
        return StorageService.getKnowledgeItems().length;
      case 'chat':
        return StorageService.getChatSessions().length;
      default:
        return 0;
    }
  };

  const renderMobileHeader = () => {
    if (mobileView === 'tabs') {
      return (
        <header className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900">AI Note</h1>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          {showMobileMenu && (
            <div className="border-t bg-white p-4">
              <div className="text-sm text-gray-600">
                智能笔记助手 - 记录想法，构建知识
              </div>
            </div>
          )}
        </header>
      );
    }

    return (
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleBackToList}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {mobileView === 'note-list' && '笔记列表'}
            {mobileView === 'note-editor' && (selectedNote ? '编辑笔记' : '新建笔记')}
            {mobileView === 'knowledge-detail' && '知识详情'}
          </h1>
        </div>
      </header>
    );
  };

  const renderTabNavigation = () => (
    <nav className="bg-white border-t shadow-sm sticky bottom-0 z-10">
      <div className="flex">
        <button
          onClick={() => {
            setActiveTab('notes');
            setMobileView('note-list');
          }}
          className={`flex-1 flex flex-col items-center py-3 px-2 no-select touch-target ${
            activeTab === 'notes'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">笔记</span>
          <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full mt-1">
            {getTabCount('notes')}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('knowledge');
            setMobileView('tabs');
          }}
          className={`flex-1 flex flex-col items-center py-3 px-2 no-select touch-target ${
            activeTab === 'knowledge'
              ? 'text-green-600 bg-green-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Book className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">知识库</span>
          <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full mt-1">
            {getTabCount('knowledge')}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('chat');
            setMobileView('tabs');
          }}
          className={`flex-1 flex flex-col items-center py-3 px-2 no-select touch-target ${
            activeTab === 'chat'
              ? 'text-purple-600 bg-purple-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">AI问答</span>
          <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full mt-1">
            {getTabCount('chat')}
          </span>
        </button>
      </div>
    </nav>
  );

  const renderMobileContent = () => {
    if (mobileView === 'note-list') {
      return (
        <div className="flex-1 overflow-hidden">
          <NoteList
            onNoteSelect={handleNoteSelect}
            onNewNote={handleNewNote}
            selectedNoteId={selectedNote?.id}
            refreshTrigger={refreshTrigger}
          />
        </div>
      );
    }

    if (mobileView === 'note-editor') {
      return (
        <div className="flex-1 overflow-hidden">
          <NoteEditor
            note={selectedNote || undefined}
            onSave={(note) => {
              onNoteSave(note);
              setMobileView('note-list');
            }}
            onDelete={(noteId) => {
              onNoteDelete(noteId);
              setMobileView('note-list');
            }}
            onClose={() => setMobileView('note-list')}
          />
        </div>
      );
    }

    // Default tab content
    switch (activeTab) {
      case 'chat':
        return (
          <div className="flex-1 overflow-hidden">
            <Chat
              session={currentChatSession || undefined}
              onSessionUpdate={onChatSessionUpdate}
            />
          </div>
        );
      case 'knowledge':
        return (
          <div className="flex-1 overflow-hidden">
            <KnowledgeBase refreshTrigger={refreshTrigger} />
          </div>
        );
      default:
        return (
          <div className="flex-1 overflow-hidden">
            <NoteList
              onNoteSelect={handleNoteSelect}
              onNewNote={handleNewNote}
              selectedNoteId={selectedNote?.id}
              refreshTrigger={refreshTrigger}
            />
          </div>
        );
    }
  };

  return (
    <div ref={touchRef} className="flex flex-col h-full bg-gray-50">
      {renderMobileHeader()}
      {renderMobileContent()}
      {renderTabNavigation()}
    </div>
  );
};