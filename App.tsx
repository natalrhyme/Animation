import React, { useState, useCallback, useEffect } from 'react';
import PromptInput from './components/PromptInput';
import CodeDisplay from './components/CodeDisplay';
import AnimationPlayer from './components/AnimationPlayer';
import ChatInput from './components/ChatInput';
import ConsoleDisplay from './components/ConsoleDisplay';
import { generateAnimationCode, refineCodeWithChat } from './services/geminiService';
import { AppState, ChatMessage, ConsoleMessage } from './types';

// FIX: Implement the main App component to structure the application UI and logic.
function App() {
  const [prompt, setPrompt] = useState('');
  const [animationCode, setAnimationCode] = useState('');
  const [script, setScript] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // FIX: Listen for console messages posted from the animation iframe.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'console') {
        const { level, message } = event.data;
        setConsoleMessages(prev => [...prev, { level, message }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setAppState(AppState.GENERATING_CODE);
    setError(null);
    setAnimationCode('');
    setScript('');
    setChatHistory([]); // Reset chat history
    setChatMessage('');
    setConsoleMessages([]); // Reset console messages

    try {
      const { code, script } = await generateAnimationCode(prompt);
      if (code.startsWith('// Error')) {
        throw new Error(code);
      }
      setAnimationCode(code);
      setScript(script);
      // Prime the chat history so the model knows what code it's working with.
      setChatHistory([{
        role: 'user',
        parts: [{ text: `Generate a p5.js animation for the following prompt: ${prompt}` }]
      }, {
        role: 'model',
        parts: [{ text: JSON.stringify({ code, script }) }]
      }]);
      setAppState(AppState.DONE);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      setAppState(AppState.ERROR);
      console.error(e);
    }
  }, [prompt]);

  const handleChatSubmit = useCallback(async () => {
    if (!chatMessage.trim() || !animationCode) return;

    setAppState(AppState.REFINING_CODE);
    setError(null);
    setConsoleMessages([]); // Also clear console on refinement
    
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', parts: [{ text: chatMessage }] },
    ];
    setChatHistory(newHistory);
    setChatMessage('');

    try {
      const { code: refinedCode, script: refinedScript } = await refineCodeWithChat(chatMessage, animationCode, script, chatHistory);
      if (refinedCode.startsWith('// Error')) {
        throw new Error(refinedCode);
      }
      setAnimationCode(refinedCode);
      setScript(refinedScript);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: JSON.stringify({ code: refinedCode, script: refinedScript }) }] }]);
      setAppState(AppState.DONE);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      setAppState(AppState.ERROR);
      console.error(e);
    }
  }, [chatMessage, animationCode, script, chatHistory]);

  const isLoading = appState === AppState.GENERATING_CODE || appState === AppState.REFINING_CODE;

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800 p-4 border-b border-gray-700 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-indigo-400">
          Gen P5* Animator
        </h1>
        <p className="text-center text-gray-400 mt-1">
          Create p5.js animations with the power of Gemini
        </p>
      </header>
      
      <main className={`container mx-auto p-4 md:p-8 grid gap-8 ${isFullscreen ? 'hidden' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleGenerate}
            isLoading={appState === AppState.GENERATING_CODE}
          />
          {animationCode && (
            <React.Fragment>
              <CodeDisplay 
                code={animationCode}
                isLoading={isLoading}
              />
              <ConsoleDisplay 
                messages={consoleMessages}
                onClear={() => setConsoleMessages([])}
              />
            </React.Fragment>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          <AnimationPlayer
            appState={appState}
            animationCode={animationCode}
            script={script}
            error={error}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
          />
          {/* FIX: Show ChatInput when appState is DONE or REFINING_CODE to keep it visible but disabled during refinement. */}
          {(appState === AppState.DONE || appState === AppState.REFINING_CODE) && animationCode && (
            <ChatInput 
              message={chatMessage}
              setMessage={setChatMessage}
              onSubmit={handleChatSubmit}
              isLoading={appState === AppState.REFINING_CODE}
            />
          )}
        </div>
      </main>

      {/* Fullscreen Player */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-900">
          <AnimationPlayer
              appState={appState}
              animationCode={animationCode}
              script={script}
              error={error}
              isFullscreen={isFullscreen}
              setIsFullscreen={setIsFullscreen}
          />
        </div>
      )}
    </div>
  );
}

export default App;