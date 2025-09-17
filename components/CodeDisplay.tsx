import React, { useState, useEffect } from 'react';

interface CodeDisplayProps {
  code: string;
  isLoading: boolean;
}

const CopyIcon: React.FC<{ copied: boolean }> = ({ copied }) => {
    if (copied) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    );
};

// FIX: Create the CodeDisplay component to render generated code.
const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  // Reset copied state when code changes
  useEffect(() => {
    setCopied(false);
  }, [code]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-300">2. Generated p5.js Code</h2>
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors z-10"
          aria-label="Copy code"
          disabled={isLoading}
        >
          <CopyIcon copied={copied} />
        </button>
        <pre className={`language-javascript transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <code className="block p-4 text-sm overflow-x-auto max-h-96">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeDisplay;
