
import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const MagicWandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.046a1 1 0 01-1.447.894l-1 1a1 1 0 01-1.414-1.414l1-1a1 1 0 011.163-.224zM4.046 12.3a1 1 0 01-1.414 1.414l-1-1a1 1 0 01.224-1.163A1 1 0 012 11h1.046a1 1 0 01.894 1.447l-1 1zM12 18v1.046a1 1 0 01-.894 1.447l-1 1a1 1 0 01-1.414-1.414l1-1a1 1 0 011.163-.224A1 1 0 0112 18zM18.954 8.7a1 1 0 011.414-1.414l1 1a1 1 0 01-.224 1.163A1 1 0 0118 10h-1.046a1 1 0 01-.894-1.447l1-1zM10 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zm-7 8a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm12-2a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" clipRule="evenodd" />
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);


const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSubmit();
    }
  };
  
  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="prompt-input" className="text-lg font-semibold text-gray-300">
        1. Describe Your Animation
      </label>
      <textarea
        id="prompt-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., Animate the Pythagorean theorem with a right-angled triangle."
        rows={5}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none placeholder-gray-500"
        disabled={isLoading}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading || !prompt.trim()}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <MagicWandIcon />
            Generate Animation
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 text-center">Tip: Press Cmd/Ctrl + Enter to submit.</p>
    </div>
  );
};

export default PromptInput;
