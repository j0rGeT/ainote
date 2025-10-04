import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Square, Trash2 } from 'lucide-react';
import { SpeechRecognitionState } from '../types';
import { speechRecognitionService } from '../services/speechRecognition';

interface SpeechToTextProps {
  onTranscriptChange?: (transcript: string) => void;
  onInsertText?: (text: string) => void;
}

export const SpeechToText: React.FC<SpeechToTextProps> = ({ onTranscriptChange, onInsertText }) => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
  });

  useEffect(() => {
    const unsubscribe = speechRecognitionService.subscribe((newState) => {
      setState(newState);

      const fullTranscript = newState.transcript + (newState.interimTranscript ? ' ' + newState.interimTranscript : '');
      onTranscriptChange?.(fullTranscript);
    });

    return () => {
      unsubscribe();
    };
  }, [onTranscriptChange]);

  const toggleListening = () => {
    speechRecognitionService.toggleListening();
  };

  const clearTranscript = () => {
    speechRecognitionService.clearTranscript();
    onTranscriptChange?.('');
  };

  const insertText = () => {
    const fullTranscript = speechRecognitionService.getFullTranscript();
    if (fullTranscript && onInsertText) {
      onInsertText(fullTranscript);
      speechRecognitionService.clearTranscript();
    }
  };

  if (!state.isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <MicOff className="w-5 h-5" />
          <span className="font-medium">语音识别不可用</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          您的浏览器不支持语音识别功能。请使用支持 Web Speech API 的现代浏览器（如 Chrome、Edge）。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${state.isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="font-medium text-gray-900">
            {state.isListening ? '正在聆听...' : '语音转文字'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {state.transcript && (
            <button
              onClick={clearTranscript}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="清空文本"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all duration-200 ${
              state.isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            title={state.isListening ? '停止录音' : '开始录音'}
          >
            {state.isListening ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      <div className="space-y-3">
        {state.transcript && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              已识别文本
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed">
              {state.transcript}
            </div>
          </div>
        )}

        {state.interimTranscript && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              正在识别...
            </label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 leading-relaxed italic">
              {state.interimTranscript}
            </div>
          </div>
        )}

        {!state.transcript && !state.interimTranscript && (
          <div className="text-center py-8 text-gray-500">
            <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">点击麦克风按钮开始录音</p>
          </div>
        )}
      </div>

      {state.transcript && onInsertText && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={insertText}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            插入到笔记
          </button>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>💡 使用提示：</p>
        <p>• 请确保在安静环境下使用，发音清晰</p>
        <p>• 支持中文普通话识别</p>
        <p>• 点击麦克风按钮开始/停止录音</p>
      </div>
    </div>
  );
};