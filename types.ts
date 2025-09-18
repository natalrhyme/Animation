// FIX: Define and export the AppState enum to be used across components for state management.
export enum AppState {
  IDLE,
  GENERATING_CODE,
  REFINING_CODE,
  DONE,
  ERROR,
}

// FIX: Define and export the ChatMessage interface for maintaining chat history with the Gemini API.
export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

// FIX: Define and export the ConsoleMessage interface for displaying logs from the p5.js iframe.
export interface ConsoleMessage {
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
}
