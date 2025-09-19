import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';

interface AnimationPlayerProps {
  appState: AppState;
  animationCode: string;
  script: string;
  error: string | null;
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

// --- ICONS ---
const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const EnterFullscreenIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
  </svg>
);
const ExitFullscreenIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-4-4m0 0l-4 4m4-4V3m0 16v-4m0 0l4-4m-4 4l-4 4" />
  </svg>
);
const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const SpeakerOnIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);
const SpeakerOffIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);
// --- END ICONS ---


type RecordConfig = { format: 'gif', duration: 5 } | { format: 'webm', duration: 10 };

const createIframeContent = (code: string, recordConfig?: RecordConfig) => {
    // FIX: This script intercepts console logs and errors inside the iframe and sends them to the parent window.
    const consoleInterceptor = `
        <script>
          const formatArg = (arg) => {
            if (arg instanceof Error) {
              return arg.stack || arg.message;
            }
            if (typeof arg === 'object' && arg !== null) {
              try {
                // A simple stringify that handles functions
                return JSON.stringify(arg, (key, value) => 
                  typeof value === 'function' ? \`[Function: \${value.name || 'anonymous'}]\` : value);
              } catch (e) {
                return '[Unserializable Object]';
              }
            }
            return String(arg);
          };

          const originalConsole = { ...console };
          ['log', 'warn', 'error', 'info'].forEach(level => {
            console[level] = (...args) => {
              originalConsole[level](...args); // Keep logging to dev tools
              const message = args.map(formatArg).join(' ');
              window.parent.postMessage({
                type: 'console',
                level: level,
                message: message
              }, '*');
            };
          });

          window.onerror = (message, source, lineno, colno, error) => {
            originalConsole.error('Uncaught Error:', message, error);
            const formattedMessage = error ? formatArg(error) : \`\${message} at line \${lineno}:\${colno}\`;
            window.parent.postMessage({
              type: 'console',
              level: 'error',
              message: \`Uncaught: \${formattedMessage}\`
            }, '*');
            return true; // Prevents the browser's default error handling
          };

          window.onunhandledrejection = (event) => {
            originalConsole.warn('Unhandled Rejection:', event.reason);
            window.parent.postMessage({
              type: 'console',
              level: 'warn',
              message: \`Unhandled Promise Rejection: \${formatArg(event.reason)}\`
            }, '*');
          };
        </script>
    `;

    const standardHeader = `
      <!DOCTYPE html>
      <html>
        <head>
          ${consoleInterceptor}
          <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/addons/p5.sound.min.js"></script>
          <style>
            body { margin: 0; overflow: hidden; background-color: #111827; }
            canvas { display: block; }
          </style>
        </head>
        <body>
    `;

    const standardFooter = `
        </body>
      </html>
    `;

    const errorHandler = `
      document.body.innerHTML = '<div style="color: #fca5a5; font-family: sans-serif; padding: 1rem;"><strong>Render Error:</strong><br/>' + e.message + '</div>';
    `;

    if (!recordConfig) {
        return `
            ${standardHeader}
            <script>
              try { ${code} } catch (e) { 
                console.error('Execution Error:', e);
                ${errorHandler} 
              }
            </script>
            ${standardFooter}
        `;
    }

    // --- Recording Logic ---
    const framerate = recordConfig.format === 'gif' ? 30 : 60;
    const quality = recordConfig.format === 'gif' ? 90 : 100;

    // Inject capturer.start() into setup() and capturer.capture() into draw()
    // This is safer than monkey-patching and works with p5 instance mode too.
    const modifiedCode = code
        .replace(
            /(function\s+setup\s*\(\s*\)\s*\{)/,
            `$1\n  capturer.start();`
        )
        .replace(
            /(function\s+draw\s*\(\s*\)\s*\{)/,
            `$1\n  if (document.querySelector('canvas')) capturer.capture(document.querySelector('canvas'));`
        );

    return `
        ${standardHeader}
        <script src="https://unpkg.com/ccapture.js@1.1.0/build/CCapture.all.min.js"></script>
        <script>
          const capturer = new CCapture({
            format: '${recordConfig.format}',
            framerate: ${framerate},
            quality: ${quality},
            verbose: false,
          });
          
          try {
            ${modifiedCode}
          } catch (e) {
            console.error('Execution Error:', e);
            ${errorHandler}
          }

          setTimeout(() => {
              capturer.stop();
              capturer.save();
          }, ${recordConfig.duration * 1000});
        </script>
        ${standardFooter}
    `;
};


const PlayerContent: React.FC<{ appState: AppState; animationCode: string; error: string | null; recordConfig: RecordConfig | null }> = ({ appState, animationCode, error, recordConfig }) => {
  switch (appState) {
    case AppState.IDLE:
      return (
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium text-gray-300">Live Preview</h3>
          <p>Your rendered animation will appear here.</p>
        </div>
      );
    case AppState.GENERATING_CODE:
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                <LoadingSpinner />
                <p className="font-medium">Generating creative code...</p>
            </div>
        );
    case AppState.DONE:
      return (
        <iframe
          srcDoc={createIframeContent(animationCode, recordConfig)}
          title="Animation Preview"
          sandbox="allow-scripts"
          className="w-full h-full bg-gray-900"
          key={animationCode + (recordConfig ? recordConfig.format + recordConfig.duration : 'live')} // Force re-render
        />
      );
    case AppState.ERROR:
      return (
        <div className="text-center text-red-400 p-4 w-full">
          <h3 className="text-lg font-bold">Error</h3>
          <p className="text-sm break-words">{error}</p>
        </div>
      );
    default:
      return null;
  }
};

const ExportMenu: React.FC<{ onSelect: (config: RecordConfig) => void }> = ({ onSelect }) => {
  return (
    <div className="absolute bottom-12 right-3 z-20 bg-gray-700 rounded-md shadow-lg py-1 w-48">
      <button 
        onClick={() => onSelect({ format: 'gif', duration: 5 })}
        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
        Record 5s GIF
      </button>
      <button 
        onClick={() => onSelect({ format: 'webm', duration: 10 })}
        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
        Record 10s WebM
      </button>
    </div>
  )
}


const AnimationPlayer: React.FC<AnimationPlayerProps> = ({ appState, animationCode, script, error, isFullscreen, setIsFullscreen }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [recordConfig, setRecordConfig] = useState<RecordConfig | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Speech synthesis logic
  useEffect(() => {
    const cleanup = () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
    
    if (appState === AppState.DONE && script && !isMuted) {
      cleanup();
      
      const utterance = new SpeechSynthesisUtterance(script);
      window.speechSynthesis.speak(utterance);
    }

    return cleanup;
  }, [script, appState, isMuted]);

  const handleStartRecording = (config: RecordConfig) => {
      setShowExportMenu(false);
      setRecordConfig(config);
      // Automatically clear recording state after it's finished
      setTimeout(() => {
          setRecordConfig(null);
      }, (config.duration * 1000) + 1500); // Add a buffer for saving
  };

  // Close export menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="flex flex-col gap-4 h-full">
      {!isFullscreen && (
        <h2 className="text-lg font-semibold text-gray-300">3. Live Animation Preview</h2>
      )}
      <div className={
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-gray-900 w-screen h-screen flex items-center justify-center' 
          : 'aspect-[9/16] w-full max-w-sm mx-auto bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden'
      }>
        <PlayerContent appState={appState} animationCode={animationCode} error={error} recordConfig={recordConfig} />
        
        {recordConfig && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white z-20">
            <LoadingSpinner />
            <p className="mt-4 font-semibold">Recording {recordConfig.duration}s {recordConfig.format.toUpperCase()}...</p>
            <p className="text-sm text-gray-400">Download will start automatically.</p>
          </div>
        )}

        {appState === AppState.DONE && !recordConfig && (
          <div ref={exportMenuRef} className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
            {showExportMenu && <ExportMenu onSelect={handleStartRecording} />}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-gray-700 bg-opacity-50 hover:bg-opacity-100 hover:bg-gray-600 rounded-md text-gray-300 transition-all"
              aria-label={isMuted ? 'Unmute narration' : 'Mute narration'}
            >
              {isMuted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
            </button>
            <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 bg-gray-700 bg-opacity-50 hover:bg-opacity-100 hover:bg-gray-600 rounded-md text-gray-300 transition-all"
                aria-label="Download animation"
            >
                <DownloadIcon />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-gray-700 bg-opacity-50 hover:bg-opacity-100 hover:bg-gray-600 rounded-md text-gray-300 transition-all"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
            </button>
          </div>
        )}
      </div>
      {script && !isFullscreen && (
        <div className="mt-[-1rem]">
          <h3 className="text-md font-semibold text-gray-400 mb-2">Narration Script</h3>
          <p className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 italic">
            "{script}"
          </p>
        </div>
      )}
    </div>
  );
};

export default AnimationPlayer;