import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Type, Hash, ToggleLeft, MoreHorizontal } from 'lucide-react';
import { JsonValue, TreeNodeProps } from '../types';

const getDataType = (value: JsonValue): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
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
    
    if (type === 'number') newValue = Number(editValue);
    if (type === 'boolean') newValue = editValue === 'true';
    if (type === 'null') newValue = null;
    
    // Basic validation to prevent NaN for numbers
    if (type === 'number' && isNaN(newValue)) {
        // Revert or alert? Just revert for now
        return;
    }

    onUpdate(path, newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const renderValue = () => {
    if (isEditing) {
      return (
        <input
          autoFocus
          className="bg-slate-700 text-white px-1 rounded outline-none border border-blue-500 min-w-[50px]"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    switch (type) {
      case 'string':
        return <span className="text-emerald-400 break-all">"{value as string}"</span>;
      case 'number':
        return <span className="text-blue-400">{String(value)}</span>;
      case 'boolean':
        return <span className="text-purple-400 font-semibold">{String(value)}</span>;
      case 'null':
        return <span className="text-slate-500 italic">null</span>;
      case 'object':
        return <span className="text-slate-500 text-xs ml-2">{`{${Object.keys(value as object).length}}`}</span>;
      case 'array':
        return <span className="text-slate-500 text-xs ml-2">{`[${(value as any[]).length}]`}</span>;
      default:
        return <span className="text-slate-300">{String(value)}</span>;
    }
  };

  const Icon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <div className="font-mono text-sm leading-6 select-text">
      <div 
        className={`flex items-start hover:bg-slate-800/50 rounded px-1 cursor-pointer transition-colors group ${isEditing ? 'bg-slate-800' : ''}`}
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
        <div className="flex-1 flex items-center">
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
              {renderValue()}
              {!isLast && <span className="text-slate-500">,</span>}
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