import React from 'react';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

// FIX: Create the ChatInput component for code refinement interaction.
const ChatInput: React.FC<ChatInputProps> = ({ message, setMessage, onSubmit, isLoading }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <label htmlFor="chat-input" className="text-lg font-semibold text-gray-300">
                4. Refine Your Animation
            </label>
            <div className="flex gap-2">
                <textarea
                    id="chat-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Make the circles blue."
                    rows={2}
                    className="flex-grow bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none placeholder-gray-500"
                    disabled={isLoading}
                />
                <button
                    onClick={onSubmit}
                    disabled={isLoading || !message.trim()}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    aria-label="Send message"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <SendIcon />
                    )}
                </button>
            </div>
             <p className="text-xs text-gray-500 text-center">Tip: Press Enter to send, Shift + Enter for a new line.</p>
        </div>
    );
};

export default ChatInput;
