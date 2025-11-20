import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import { JsonValue, TreeNodeProps } from '../types';

const getDataType = (value: JsonValue): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

// Auto-resizing editor that matches the content width/height exactly
const AutoResizeEditor: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onFinish: () => void;
  onCancel: () => void;
}> = ({ value, onChange, onFinish, onCancel }) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter saves, Shift+Enter inserts newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onFinish();
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <div className="inline-grid align-top min-w-[2rem] max-w-full relative">
      {/* Shadow element to force dimensions. Matches textarea styling exactly. */}
      <div 
        aria-hidden="true"
        className="col-start-1 row-start-1 invisible whitespace-pre-wrap break-all px-1.5 py-0.5 border border-transparent font-mono text-sm leading-6"
      >
        {value || ' '}
      </div>
      
      {/* Actual Editor */}
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onFinish}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="col-start-1 row-start-1 w-full h-full resize-none overflow-hidden bg-slate-700 text-white px-1.5 py-0.5 rounded outline-none border border-indigo-500 font-mono text-sm leading-6 break-all shadow-lg z-10"
        spellCheck={false}
      />
    </div>
  );
};

export const JsonTree: React.FC<TreeNodeProps> = ({ keyName, value, isLast, depth, onUpdate, path, expanded: initialExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');

  const type = getDataType(value);
  const isObject = type === 'object' || type === 'array';
  const isEmpty = isObject && Object.keys(value as object).length === 0;

  // Auto-expand root
  useEffect(() => {
    if (depth === 0) setIsExpanded(true);
  }, [depth]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isObject) return;
    setIsEditing(true);
    setEditValue(String(value));
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    let newValue: any = editValue;
    
    // Basic type preservation logic
    if (type === 'number') {
        const n = Number(editValue);
        if (!isNaN(n)) newValue = n;
    } 
    else if (type === 'boolean') {
        if (editValue === 'true') newValue = true;
        if (editValue === 'false') newValue = false;
    }
    else if (type === 'null') {
        if (editValue === 'null') newValue = null;
    }
    
    onUpdate(path, newValue);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const Icon = isExpanded ? ChevronDown : ChevronRight;

  const renderEditableValue = () => {
    if (isEditing) {
      // For strings, we render the editor inside quotes visually
      // For primitives, just the editor
      if (type === 'string') {
         return (
           <>
             <span className="text-emerald-400">"</span>
             <AutoResizeEditor 
                value={editValue} 
                onChange={setEditValue} 
                onFinish={handleSaveEdit} 
                onCancel={handleCancelEdit}
             />
             <span className="text-emerald-400">"</span>
           </>
         );
      }
      return (
         <AutoResizeEditor 
            value={editValue} 
            onChange={setEditValue} 
            onFinish={handleSaveEdit} 
            onCancel={handleCancelEdit}
         />
      );
    }

    // Display Mode
    return (
      <span className="whitespace-pre-wrap break-all">
         {type === 'string' && <span className="text-emerald-400">"{value as string}"</span>}
         {type === 'number' && <span className="text-blue-400">{String(value)}</span>}
         {type === 'boolean' && <span className="text-purple-400 font-semibold">{String(value)}</span>}
         {type === 'null' && <span className="text-slate-500 italic">null</span>}
      </span>
    );
  };

  return (
    <div className="font-mono text-sm leading-6 select-text">
      <div 
        className={`flex items-start hover:bg-slate-800/50 rounded px-1 cursor-pointer transition-colors group ${isEditing ? 'bg-slate-800/30' : ''}`}
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={isObject ? handleToggle : handleStartEdit}
      >
        {/* Expand/Collapse Icon */}
        <div className="w-5 h-6 flex items-center justify-center flex-shrink-0 text-slate-500 mr-1">
          {isObject && !isEmpty && (
            <Icon size={14} />
          )}
        </div>

        {/* Key */}
        {keyName !== null && (
          <span className="text-slate-300 mr-1 flex-shrink-0 font-medium">
            "{keyName}":
          </span>
        )}

        {/* Value (Primitive) or Bracket (Object) */}
        <div className="flex-1 flex items-center min-w-0">
          {isObject ? (
            <>
              <span className="text-slate-400">
                {type === 'array' ? '[' : '{'}
              </span>
              {!isExpanded && !isEmpty && (
                 <span className="text-slate-500 mx-1 flex items-center">
                   <MoreHorizontal size={12} />
                 </span>
              )}
              {!isExpanded && (
                <span className="text-slate-400">
                  {type === 'array' ? ']' : '}'}
                   {!isLast && <span className="text-slate-500">,</span>}
                   {/* Count indicator when collapsed */}
                   <span className="text-slate-600 text-xs ml-2 italic">
                     {Array.isArray(value) ? `${value.length} items` : `${Object.keys(value as object).length} keys`}
                   </span>
                </span>
              )}
            </>
          ) : (
            <>
              {renderEditableValue()}
              {!isLast && <span className="text-slate-500 ml-0.5">,</span>}
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {isObject && isExpanded && !isEmpty && (
        <div>
          {Object.entries(value as object).map(([key, val], index, arr) => (
            <JsonTree
              key={index}
              keyName={type === 'array' ? null : key}
              value={val}
              isLast={index === arr.length - 1}
              depth={depth + 1}
              onUpdate={onUpdate}
              path={[...path, type === 'array' ? index.toString() : key]}
            />
          ))}
          <div 
            className="hover:bg-slate-800/50 rounded px-1"
            style={{ paddingLeft: `${depth * 1.5 + 1.5}rem` }}
          >
            <span className="text-slate-400">
              {type === 'array' ? ']' : '}'}
              {!isLast && <span className="text-slate-500">,</span>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};