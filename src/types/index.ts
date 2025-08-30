export interface Snippet {
  id: string;
  name: string;
  shortcut: string;
  content: string;
  folderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  snippetCount: number;
  createdAt: Date;
}

export interface FormField {
  id: string;
  type: 'formtext' | 'formparagraph' | 'formtoggle' | 'formdropdown';
  name: string;
  label?: string;
  defaultValue?: string | boolean;
  options?: string[]; // For dropdown
  required?: boolean;
}

export interface ParsedSnippet {
  content: string;
  fields: FormField[];
  formulas: Formula[];
}

export interface Formula {
  id: string;
  expression: string;
  result?: string | number;
}

export interface SnippetUsage {
  snippetId: string;
  usedAt: Date;
  timesSaved: number;
}