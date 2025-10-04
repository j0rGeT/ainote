import { useState, useCallback, useEffect } from 'react';
import { MessageSquare, FileText, Book } from 'lucide-react';
import { Chat } from './components/Chat';
import { NoteEditor } from './components/NoteEditor';
import { NoteList } from './components/NoteList';
import { KnowledgeBase } from './components/KnowledgeBase';
import { MobileLayout } from './components/MobileLayout';
import { Note, ChatSession } from './types';
import { StorageService } from './services/storage';

type ActiveTab = 'chat' | 'notes' | 'knowledge';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [currentChatSession, setCurrentChatSession] = useState<ChatSession | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleNoteSelect = useCallback((note: Note) => {
    setSelectedNote(note);
  }, []);

  const handleNewNote = useCallback(() => {
    setSelectedNote(null);
  }, []);

  const handleNoteSave = useCallback((note: Note) => {
    setSelectedNote(note);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleNoteDelete = useCallback((noteId: string) => {
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
    setRefreshTrigger(prev => prev + 1);
  }, [selectedNote]);

  const handleChatSessionUpdate = useCallback((session: ChatSession) => {
    setCurrentChatSession(session);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <Chat
            session={currentChatSession || undefined}
            onSessionUpdate={handleChatSessionUpdate}
          />
        );
      case 'notes':
        return (
          <div className="flex h-full">
            <div className="w-1/3 border-r">
              <NoteList
                onNoteSelect={handleNoteSelect}
                onNewNote={handleNewNote}
                selectedNoteId={selectedNote?.id}
                refreshTrigger={refreshTrigger}
              />
            </div>
            <div className="flex-1">
              <NoteEditor
                note={selectedNote || undefined}
                onSave={handleNoteSave}
                onDelete={handleNoteDelete}
                onClose={() => setSelectedNote(null)}
              />
            </div>
          </div>
        );
      case 'knowledge':
        return (
          <KnowledgeBase refreshTrigger={refreshTrigger} />
        );
      default:
        return null;
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

  if (isMobile) {
    return (
      <div className="h-screen">
        <MobileLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedNote={selectedNote}
          setSelectedNote={setSelectedNote}
          currentChatSession={currentChatSession}
          refreshTrigger={refreshTrigger}
          onNoteSave={handleNoteSave}
          onNoteDelete={handleNoteDelete}
          onChatSessionUpdate={handleChatSessionUpdate}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Note</h1>
          <div className="text-sm text-gray-500">
            智能笔记助手 - 记录想法，构建知识
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-64 bg-white border-r shadow-sm">
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('notes')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">笔记</span>
                </div>
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {getTabCount('notes')}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('knowledge')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'knowledge'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Book className="w-5 h-5" />
                  <span className="font-medium">知识库</span>
                </div>
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {getTabCount('knowledge')}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">AI 问答</span>
                </div>
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {getTabCount('chat')}
                </span>
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 提示：</p>
              <p>• 保存笔记时会自动生成知识库条目</p>
              <p>• 设置 API Key 获得更好的 AI 体验</p>
            </div>
          </div>
        </nav>

        <main className="flex-1 bg-white overflow-hidden">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

export default App;