import { Plus, Folder, Search, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Folder as FolderType, Snippet } from '@/types';

interface SidebarProps {
  folders: FolderType[];
  snippets: Snippet[];
  selectedFolderId: string | null;
  searchQuery: string;
  onFolderSelect: (folderId: string | null) => void;
  onSearchChange: (query: string) => void;
  onCreateSnippet: () => void;
  onCreateFolder: () => void;
}

export function Sidebar({
  folders,
  snippets,
  selectedFolderId,
  searchQuery,
  onFolderSelect,
  onSearchChange,
  onCreateSnippet,
  onCreateFolder
}: SidebarProps) {
  const allSnippetsCount = snippets.length;
  const unorganizedCount = snippets.filter(s => !s.folderId).length;

  return (
    <div className="w-[280px] h-screen bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Text Blaze
          </h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2">
        <Button 
          onClick={onCreateSnippet}
          className="w-full justify-start gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-primary-foreground"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          New Snippet
        </Button>
        <Button 
          onClick={onCreateFolder}
          variant="outline" 
          className="w-full justify-start gap-2"
          size="sm"
        >
          <Folder className="w-4 h-4" />
          New Folder
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {/* All Snippets */}
          <button
            onClick={() => onFolderSelect(null)}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
              selectedFolderId === null 
                ? 'bg-accent text-accent-foreground shadow-sm' 
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-medium">All Snippets</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {allSnippetsCount}
            </Badge>
          </button>

          {/* Unorganized */}
          {unorganizedCount > 0 && (
            <button
              onClick={() => onFolderSelect('unorganized')}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                selectedFolderId === 'unorganized' 
                  ? 'bg-accent text-accent-foreground shadow-sm' 
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="font-medium">Unorganized</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {unorganizedCount}
              </Badge>
            </button>
          )}

          {/* Folders */}
          {folders.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => onFolderSelect(folder.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                      selectedFolderId === folder.id 
                        ? 'bg-accent text-accent-foreground shadow-sm' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {folder.snippetCount}
                    </Badge>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}