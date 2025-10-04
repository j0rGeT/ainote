import { Note, KnowledgeItem } from '../types';
import { AIService } from './ai';
import { StorageService } from './storage';
import { v4 as uuidv4 } from 'uuid';

export class KnowledgeConverterService {
  static async convertNoteToKnowledge(note: Note, apiKey?: string): Promise<KnowledgeItem> {
    const summary = await AIService.generateSummary(note.content, apiKey);
    
    const knowledgeItem: KnowledgeItem = {
      id: uuidv4(),
      title: note.title,
      content: note.content,
      summary,
      tags: note.tags,
      sourceNoteId: note.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return knowledgeItem;
  }

  static async autoConvertNote(note: Note, apiKey?: string): Promise<void> {
    if (this.shouldConvertToKnowledge(note)) {
      try {
        const existingItems = StorageService.getKnowledgeItems();
        const existingItem = existingItems.find(item => item.sourceNoteId === note.id);

        if (existingItem) {
          const updatedSummary = await AIService.generateSummary(note.content, apiKey);
          const updatedItem: KnowledgeItem = {
            ...existingItem,
            title: note.title,
            content: note.content,
            summary: updatedSummary,
            tags: note.tags,
            updatedAt: new Date(),
          };
          StorageService.saveKnowledgeItem(updatedItem);
        } else {
          const knowledgeItem = await this.convertNoteToKnowledge(note, apiKey);
          StorageService.saveKnowledgeItem(knowledgeItem);
        }
      } catch (error) {
        console.error('Error converting note to knowledge:', error);
      }
    }
  }

  static shouldConvertToKnowledge(note: Note): boolean {
    const minLength = 100;
    const hasContent = note.content.trim().length >= minLength;
    const hasTitle = note.title.trim().length > 0;
    
    return hasContent && hasTitle;
  }

  static async batchConvertNotes(apiKey?: string): Promise<void> {
    const notes = StorageService.getNotes();
    const knowledgeItems = StorageService.getKnowledgeItems();
    const existingSourceIds = new Set(knowledgeItems.map(item => item.sourceNoteId));

    const notesToConvert = notes.filter(note => 
      !existingSourceIds.has(note.id) && this.shouldConvertToKnowledge(note)
    );

    for (const note of notesToConvert) {
      try {
        await this.autoConvertNote(note, apiKey);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error converting note ${note.id}:`, error);
      }
    }
  }

  static getConversionStats(): {
    totalNotes: number;
    convertedNotes: number;
    conversionRate: number;
  } {
    const notes = StorageService.getNotes();
    const knowledgeItems = StorageService.getKnowledgeItems();
    
    const eligibleNotes = notes.filter(note => this.shouldConvertToKnowledge(note));
    const convertedNotes = knowledgeItems.filter(item => item.sourceNoteId).length;
    
    return {
      totalNotes: eligibleNotes.length,
      convertedNotes,
      conversionRate: eligibleNotes.length > 0 ? convertedNotes / eligibleNotes.length : 0,
    };
  }
}