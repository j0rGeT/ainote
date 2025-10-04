import { SpeechRecognitionState } from '../types';

export class SpeechRecognitionService {
  private recognition: any;
  private state: SpeechRecognitionState;
  private listeners: ((state: SpeechRecognitionState) => void)[] = [];

  constructor() {
    this.state = {
      isListening: false,
      isSupported: false,
      transcript: '',
      interimTranscript: '',
    };

    this.initializeRecognition();
  }

  private initializeRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.state.isSupported = false;
      this.state.error = '您的浏览器不支持语音识别功能';
      this.notifyListeners();
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'zh-CN';

    this.recognition.onstart = () => {
      this.state.isListening = true;
      this.state.error = undefined;
      this.notifyListeners();
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.state.transcript += finalTranscript;
      }
      this.state.interimTranscript = interimTranscript;
      this.notifyListeners();
    };

    this.recognition.onerror = (event: any) => {
      this.state.isListening = false;
      this.state.error = this.getErrorMessage(event.error);
      this.notifyListeners();
    };

    this.recognition.onend = () => {
      this.state.isListening = false;
      this.notifyListeners();
    };

    this.state.isSupported = true;
    this.notifyListeners();
  }

  private getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'no-speech': '未检测到语音输入',
      'audio-capture': '无法访问麦克风',
      'not-allowed': '麦克风访问被拒绝',
      'network': '网络连接错误',
      'aborted': '语音识别被中止',
      'language-not-supported': '不支持当前语言',
    };

    return errorMessages[error] || `语音识别错误: ${error}`;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  startListening(): void {
    if (!this.state.isSupported || !this.recognition) {
      this.state.error = '语音识别不可用';
      this.notifyListeners();
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      this.state.error = '启动语音识别失败';
      this.notifyListeners();
    }
  }

  stopListening(): void {
    if (this.recognition && this.state.isListening) {
      this.recognition.stop();
    }
  }

  toggleListening(): void {
    if (this.state.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  clearTranscript(): void {
    this.state.transcript = '';
    this.state.interimTranscript = '';
    this.notifyListeners();
  }

  getTranscript(): string {
    return this.state.transcript + (this.state.interimTranscript ? ' ' + this.state.interimTranscript : '');
  }

  getFullTranscript(): string {
    return this.state.transcript;
  }

  subscribe(listener: (state: SpeechRecognitionState) => void): () => void {
    this.listeners.push(listener);
    listener({ ...this.state });

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): SpeechRecognitionState {
    return { ...this.state };
  }

  destroy(): void {
    if (this.recognition) {
      this.stopListening();
      this.recognition = null;
    }
    this.listeners = [];
  }
}

export const speechRecognitionService = new SpeechRecognitionService();