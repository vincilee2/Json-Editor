import React from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  error: string | null;
  wrap: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, error, wrap }) => {
  return (
    <div className="relative w-full h-full bg-[#0f172a] text-slate-300 font-mono text-sm flex flex-col">
      {error && (
        <div className="absolute bottom-4 right-4 z-20 bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded shadow-lg backdrop-blur-sm max-w-md text-xs">
          <p className="font-bold mb-1">Syntax Error</p>
          {error}
        </div>
      )}
      <textarea
        className="w-full h-full p-4 bg-transparent resize-none outline-none border-none leading-6 font-mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="Paste your JSON here..."
        style={{ 
          whiteSpace: wrap ? 'pre-wrap' : 'pre', 
          overflowWrap: wrap ? 'break-word' : 'normal',
          overflowX: wrap ? 'hidden' : 'auto' 
        }}
      />
    </div>
  );
};