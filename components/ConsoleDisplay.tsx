import React, { useEffect, useRef } from 'react';
import { ConsoleMessage } from '../types';

interface ConsoleDisplayProps {
  messages: ConsoleMessage[];
  onClear: () => void;
}

const getLevelColor = (level: ConsoleMessage['level']): string => {
  switch (level) {
    case 'error': return 'text-red-400';
    case 'warn': return 'text-yellow-400';
    case 'info': return 'text-blue-400';
    default: return 'text-gray-300';
  }
};

// FIX: Create the ConsoleDisplay component to show logs from the animation.
const ConsoleDisplay: React.FC<ConsoleDisplayProps> = ({ messages, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-300">Console</h2>
        <button
          onClick={onClear}
          className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
          disabled={messages.length === 0}
          aria-label="Clear console logs"
        >
          Clear
        </button>
      </div>
      <div 
        ref={scrollRef}
        className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm"
        aria-live="polite"
        role="log"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500">Console output will appear here.</p>
        ) : (
          messages.map((msg, index) => (
            <p key={index} className={`whitespace-pre-wrap break-words ${getLevelColor(msg.level)}`}>
              <span className="select-none mr-2 flex-shrink-0">{'>'}</span>
              <span className="flex-grow">{msg.message}</span>
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsoleDisplay;
