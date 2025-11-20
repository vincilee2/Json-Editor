export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonValue[] 
  | { [key: string]: JsonValue };

export interface EditorSettings {
  indentation: number | 'tab';
  showLineNumbers: boolean;
  wrapLines: boolean;
}

export type IndentMode = '2' | '4' | 'tab';

export interface TreeNodeProps {
  keyName: string | null;
  value: JsonValue;
  isLast: boolean;
  depth: number;
  onUpdate: (path: string[], newValue: any) => void;
  path: string[];
  expanded?: boolean;
}