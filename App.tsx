import React, { useState, useEffect, useCallback } from 'react';
import { 
  Code2, 
  Network, 
  Copy, 
  Trash2, 
  Wand2, 
  AlignLeft, 
  CheckCircle2, 
  AlertCircle,
  Bot,
  WrapText
} from 'lucide-react';
import { CodeEditor } from './components/CodeEditor';
import { JsonTree } from './components/JsonTree';
import { IndentMode, JsonValue } from './types';
import { fixJsonWithGemini, generateJsonWithGemini } from './services/geminiService';
import _ from 'lodash';

const INITIAL_JSON = JSON.stringify({
  "project": "Nexus JSON Editor",
  "version": 1.0,
  "features": [
    "Text Editor",
    "Tree View",
    "Auto-Formatting",
    "AI Repair"
  ],
  "settings": {
    "theme": "Dark",
    "active": true
  }
}, null, 2);

export default function App() {
  const [jsonString, setJsonString] = useState(INITIAL_JSON);
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [indentMode, setIndentMode] = useState<IndentMode>('2');
  const [activeTab, setActiveTab] = useState<'text' | 'tree'>('text');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [wrapLines, setWrapLines] = useState(true);

  // Parse JSON whenever string changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonString);
      setParsedJson(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setParsedJson(null);
    }
  }, [jsonString]);

  // Handle Tree Updates
  const handleTreeUpdate = useCallback((path: string[], newValue: any) => {
    if (!parsedJson) return;
    
    // Deep clone current state
    const newObj = structuredClone(parsedJson);
    
    // Traverse and update
    let current: any = newObj;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = newValue;

    // Update state (re-stringify with current indentation)
    const space = indentMode === 'tab' ? '\t' : parseInt(indentMode);
    setJsonString(JSON.stringify(newObj, null, space));
  }, [parsedJson, indentMode]);

  const formatJson = (mode: IndentMode) => {
    setIndentMode(mode);
    if (!parsedJson) return;
    const space = mode === 'tab' ? '\t' : parseInt(mode);
    setJsonString(JSON.stringify(parsedJson, null, space));
  };

  const minifyJson = () => {
    if (!parsedJson) return;
    setJsonString(JSON.stringify(parsedJson));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    // Could add toast notification here
  };

  const handleAiFix = async () => {
    if (!error) return;
    setIsAiLoading(true);
    try {
      const fixed = await fixJsonWithGemini(jsonString);
      setJsonString(fixed);
      // Also format it nicely
      const parsed = JSON.parse(fixed);
      const space = indentMode === 'tab' ? '\t' : parseInt(indentMode);
      setJsonString(JSON.stringify(parsed, null, space));
    } catch (e) {
      alert('Failed to fix JSON with AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const generated = await generateJsonWithGemini(aiPrompt);
      const parsed = JSON.parse(generated); // Ensure valid
      const space = indentMode === 'tab' ? '\t' : parseInt(indentMode);
      setJsonString(JSON.stringify(parsed, null, space));
      setShowAiModal(false);
      setAiPrompt('');
    } catch (e) {
      alert('Failed to generate JSON.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Header / Toolbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center px-4 justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Network className="text-white" size={18} />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">Nexus<span className="text-indigo-400">JSON</span></h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Formatting Tools */}
          <div className="flex bg-slate-800 rounded-md p-1 border border-slate-700 mr-2">
            <button 
              onClick={() => formatJson('2')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${indentMode === '2' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="2 Spaces"
            >
              2S
            </button>
            <button 
              onClick={() => formatJson('4')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${indentMode === '4' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="4 Spaces"
            >
              4S
            </button>
            <button 
              onClick={() => formatJson('tab')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${indentMode === 'tab' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Tab Indent"
            >
              TAB
            </button>
          </div>

          <div className="flex items-center gap-1 mr-2">
             <button 
               onClick={minifyJson}
               className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors" 
               title="Minify"
             >
               <AlignLeft size={18} />
             </button>
             <button 
               onClick={() => setWrapLines(!wrapLines)}
               className={`p-2 hover:bg-slate-800 rounded-md transition-colors ${wrapLines ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`} 
               title="Toggle Word Wrap"
             >
               <WrapText size={18} />
             </button>
          </div>

           {/* AI Actions */}
           <div className="h-6 w-px bg-slate-700 mx-2"></div>
           
           {error && (
             <button 
               onClick={handleAiFix}
               disabled={isAiLoading}
               className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-xs font-medium transition-all animate-pulse"
             >
               <Wand2 size={14} />
               {isAiLoading ? 'Fixing...' : 'Auto Fix'}
             </button>
           )}

           <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium shadow-lg shadow-indigo-500/20 transition-all"
           >
             <Bot size={14} />
             Generate
           </button>

           <div className="h-6 w-px bg-slate-700 mx-2"></div>

           <button 
             onClick={copyToClipboard}
             className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium border border-slate-700 transition-all"
           >
             <Copy size={14} />
             Copy
           </button>
           <button 
             onClick={() => setJsonString('')}
             className="p-2 hover:bg-red-900/20 hover:text-red-400 rounded-md text-slate-400 transition-colors"
             title="Clear"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile Tab Switcher (Visible only on small screens) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex md:hidden bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-xl">
          <button 
            onClick={() => setActiveTab('text')}
            className={`p-2 rounded ${activeTab === 'text' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          >
            <Code2 size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('tree')}
            className={`p-2 rounded ${activeTab === 'tree' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          >
            <Network size={20} />
          </button>
        </div>

        {/* Text Editor Pane */}
        <div className={`flex-1 border-r border-slate-800 flex flex-col min-w-0 transition-all duration-300 ${activeTab === 'tree' ? 'hidden md:flex' : 'flex'}`}>
          <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 text-xs text-slate-500 select-none">
            <span className="flex items-center gap-2 font-semibold uppercase tracking-wider"><Code2 size={12}/> Code</span>
            <span className="text-slate-600">{jsonString.length} chars</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <CodeEditor 
              value={jsonString} 
              onChange={setJsonString} 
              error={error}
              wrap={wrapLines}
            />
          </div>
        </div>

        {/* Tree Viewer Pane */}
        <div className={`flex-1 bg-[#0f172a] flex flex-col min-w-0 transition-all duration-300 ${activeTab === 'text' ? 'hidden md:flex' : 'flex'}`}>
          <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 text-xs text-slate-500 select-none">
            <span className="flex items-center gap-2 font-semibold uppercase tracking-wider"><Network size={12}/> Tree</span>
            {parsedJson && !error ? (
               <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={12}/> Valid JSON</span>
            ) : (
               <span className="flex items-center gap-1 text-red-500"><AlertCircle size={12}/> Invalid JSON</span>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {parsedJson ? (
              <JsonTree 
                keyName="root" 
                value={parsedJson} 
                isLast={true} 
                depth={0} 
                onUpdate={handleTreeUpdate}
                path={[]}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600 flex-col gap-4">
                <Network size={48} className="opacity-20" />
                <p>Fix syntax errors to view Tree</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center px-4 text-[10px] text-slate-500 justify-between flex-shrink-0">
        <div className="flex gap-4">
          <span>UTF-8</span>
          <span>JSON</span>
        </div>
        <div>
          Nexus Editor v1.0.0
        </div>
      </footer>

      {/* AI Generator Modal */}
      {showAiModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6">
             <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               <Bot className="text-indigo-500" /> Generate JSON with AI
             </h2>
             <p className="text-slate-400 text-sm mb-4">
               Describe the data you want (e.g. "A list of 5 users with names, emails, and realistic addresses").
             </p>
             <textarea 
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none mb-4 text-sm"
                placeholder="Enter prompt..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
             />
             <div className="flex justify-end gap-3">
               <button 
                 onClick={() => setShowAiModal(false)}
                 className="px-4 py-2 text-slate-400 hover:text-white text-sm"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleAiGenerate}
                 disabled={!aiPrompt.trim() || isAiLoading}
                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                 {isAiLoading ? <Wand2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                 Generate
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}