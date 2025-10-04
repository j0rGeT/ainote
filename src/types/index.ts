export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  sourceNoteId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MindMapNode {
  id: string;
  name: string;
  children?: MindMapNode[];
}

export interface MindMap {
  id: string;
  title: string;
  root: MindMapNode;
  createdAt: Date;
  updatedAt: Date;
  sourceNoteId?: string;
}

export interface Literature {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publicationDate?: string;
  source: string;
  url?: string;
  tags: string[];
  relevanceScore: number;
  createdAt: Date;
  updatedAt: Date;
  sourceNoteId?: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error?: string;
}