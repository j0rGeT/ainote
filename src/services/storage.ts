import { Note, KnowledgeItem, ChatSession } from '../types';

const STORAGE_KEYS = {
  NOTES: 'ainote_notes',
  KNOWLEDGE: 'ainote_knowledge',
  CHAT_SESSIONS: 'ainote_chat_sessions',
};

export class StorageService {
  static getNotes(): Note[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    return data ? JSON.parse(data).map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt)
    })) : [];
  }

  static saveNote(note: Note): void {
    const notes = this.getNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      notes[existingIndex] = note;
    } else {
      notes.push(note);
    }
    
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  static deleteNote(id: string): void {
    const notes = this.getNotes().filter(note => note.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  static getKnowledgeItems(): KnowledgeItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
    return data ? JSON.parse(data).map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    })) : [];
  }

  static saveKnowledgeItem(item: KnowledgeItem): void {
    const items = this.getKnowledgeItems();
    const existingIndex = items.findIndex(i => i.id === item.id);
    
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
    
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(items));
  }

  static getChatSessions(): ChatSession[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    return data ? JSON.parse(data).map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    })) : [];
  }

  static saveChatSession(session: ChatSession): void {
    const sessions = this.getChatSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
  }

  static deleteChatSession(id: string): void {
    const sessions = this.getChatSessions().filter(session => session.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
  }
}