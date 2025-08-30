import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/Sidebar';
import { SnippetCard } from '@/components/SnippetCard';
import { SnippetEditor } from '@/components/SnippetEditor';
import { SnippetRunner } from '@/components/SnippetRunner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Snippet, Folder } from '@/types';

const SAMPLE_FOLDERS: Folder[] = [
  {
    id: '1',
    name: 'Email Templates',
    color: '#ef4444',
    snippetCount: 3,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Support Responses',
    color: '#3b82f6',
    snippetCount: 2,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Sales',
    color: '#10b981',
    snippetCount: 1,
    createdAt: new Date('2024-01-05')
  }
];

const SAMPLE_SNIPPETS: Snippet[] = [
  {
    id: '1',
    name: 'Professional Email Signature',
    shortcut: '/sig',
    content: 'Best regards,\n\n{formtext: name=fullName; label=Your Full Name; default=John Doe}\n{formtext: name=title; label=Job Title; default=Software Developer}\n{formtext: name=company; label=Company; default=Tech Corp}\n\nEmail: {formtext: name=email; label=Email; default=john@techcorp.com}\nPhone: {formtext: name=phone; label=Phone; default=+1 (555) 123-4567}',
    folderId: '1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    isActive: true
  },
  {
    id: '2',
    name: 'Meeting Follow-up',
    shortcut: '/followup',
    content: 'Hi {formtext: name=clientName; label=Client Name},\n\nThank you for taking the time to meet with me {formtext: name=meetingDate; label=Meeting Date; default=today}. As discussed, here are the key points:\n\n{formparagraph: name=keyPoints; label=Key Points}\n\n{formtoggle: name=includeNextSteps; label=Include Next Steps; truetext=Next steps:\n- {formparagraph: name=nextSteps; label=Next Steps}}\n\nPlease let me know if you have any questions.\n\nBest regards,\n{formtext: name=senderName; label=Your Name}',
    folderId: '1',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-21'),
    isActive: true
  },
  {
    id: '3',
    name: 'Support Ticket Response',
    shortcut: '/support',
    content: 'Hello {formtext: name=customerName; label=Customer Name},\n\nThank you for contacting our support team regarding {formtext: name=issueSubject; label=Issue Subject}.\n\n{formtoggle: name=issueResolved; label=Issue Resolved; truetext=Great news! I was able to resolve your issue. Here\'s what I did:\n\n{formparagraph: name=resolution; label=Resolution Details}; falsetext=I\'m currently investigating your issue and will get back to you within {formtext: name=responseTime; label=Response Time; default=24 hours} with an update.}\n\nIf you have any questions, please don\'t hesitate to reach out.\n\nBest regards,\n{formtext: name=supportAgent; label=Support Agent Name}\nSupport Team',
    folderId: '2',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-20'),
    isActive: true
  },
  {
    id: '4',
    name: 'Invoice Calculator',
    shortcut: '/invoice',
    content: 'Invoice Summary\n\nClient: {formtext: name=clientName; label=Client Name}\nProject: {formtext: name=projectName; label=Project Name}\n\nHours worked: {formtext: name=hours; label=Hours; default=40}\nHourly rate: ${formtext: name=rate; label=Hourly Rate; default=75}\n\nSubtotal: ${= hours * rate}\nTax ({formtext: name=taxRate; label=Tax Rate %; default=10}%): ${= (hours * rate) * (taxRate / 100)}\nTotal: ${= (hours * rate) + ((hours * rate) * (taxRate / 100))}\n\nPayment is due within 30 days of invoice date.',
    folderId: '3',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-19'),
    isActive: true
  },
  {
    id: '5',
    name: 'Quick Greeting',
    shortcut: '/hi',
    content: 'Hello! How can I help you today?',
    folderId: null,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    isActive: true
  }
];

const Index = () => {
  const [snippets, setSnippets] = useLocalStorage<Snippet[]>('text-blaze-snippets', SAMPLE_SNIPPETS);
  const [folders, setFolders] = useLocalStorage<Folder[]>('text-blaze-folders', SAMPLE_FOLDERS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [runningSnippet, setRunningSnippet] = useState<Snippet | null>(null);
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);

  // Filter snippets based on search and folder
  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.shortcut.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFolder = selectedFolderId === null ? true :
                         selectedFolderId === 'unorganized' ? !snippet.folderId :
                         snippet.folderId === selectedFolderId;
    
    return matchesSearch && matchesFolder;
  });

  const handleCreateSnippet = () => {
    setEditingSnippet(null);
    setIsEditorOpen(true);
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsEditorOpen(true);
  };

  const handleSaveSnippet = (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSnippet) {
      // Update existing snippet
      setSnippets(prev => prev.map(s => 
        s.id === editingSnippet.id 
          ? { ...s, ...snippetData, updatedAt: new Date() }
          : s
      ));
      toast({
        title: 'Snippet updated',
        description: `${snippetData.name} has been updated successfully.`,
      });
    } else {
      // Create new snippet
      const newSnippet: Snippet = {
        id: Math.random().toString(36).substr(2, 9),
        ...snippetData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setSnippets(prev => [newSnippet, ...prev]);
      toast({
        title: 'Snippet created',
        description: `${snippetData.name} has been created successfully.`,
      });
    }
    setIsEditorOpen(false);
    setEditingSnippet(null);
  };

  const handleDeleteSnippet = (snippetId: string) => {
    const snippet = snippets.find(s => s.id === snippetId);
    setSnippets(prev => prev.filter(s => s.id !== snippetId));
    toast({
      title: 'Snippet deleted',
      description: `${snippet?.name || 'Snippet'} has been deleted.`,
    });
  };

  const handleRunSnippet = (snippet: Snippet) => {
    setRunningSnippet(snippet);
    setIsRunnerOpen(true);
  };

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied!',
        description: 'Content copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy content',
        variant: 'destructive',
      });
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const newFolder: Folder = {
        id: Math.random().toString(36).substr(2, 9),
        name: folderName,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        snippetCount: 0,
        createdAt: new Date()
      };
      setFolders(prev => [...prev, newFolder]);
      toast({
        title: 'Folder created',
        description: `${folderName} folder has been created.`,
      });
    }
  };

  // Update folder snippet counts
  useEffect(() => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      snippetCount: snippets.filter(s => s.folderId === folder.id).length
    })));
  }, [snippets, setFolders]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        folders={folders}
        snippets={snippets}
        selectedFolderId={selectedFolderId}
        searchQuery={searchQuery}
        onFolderSelect={setSelectedFolderId}
        onSearchChange={setSearchQuery}
        onCreateSnippet={handleCreateSnippet}
        onCreateFolder={handleCreateFolder}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedFolderId === null ? 'All Snippets' :
                   selectedFolderId === 'unorganized' ? 'Unorganized' :
                   folders.find(f => f.id === selectedFolderId)?.name || 'Snippets'}
                </h1>
                <p className="text-muted-foreground">
                  {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <Button 
                onClick={handleCreateSnippet}
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Snippet
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <Plus className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No snippets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first snippet to get started'}
              </p>
              <Button onClick={handleCreateSnippet} className="bg-gradient-to-r from-primary to-primary-glow">
                <Plus className="w-4 h-4 mr-2" />
                Create Snippet
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onEdit={handleEditSnippet}
                  onDelete={handleDeleteSnippet}
                  onRun={handleRunSnippet}
                  onCopy={handleCopyContent}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <SnippetEditor
        snippet={editingSnippet}
        folders={folders}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingSnippet(null);
        }}
        onSave={handleSaveSnippet}
        onTest={handleRunSnippet}
      />

      <SnippetRunner
        snippet={runningSnippet}
        isOpen={isRunnerOpen}
        onClose={() => {
          setIsRunnerOpen(false);
          setRunningSnippet(null);
        }}
      />
    </div>
  );
};

export default Index;
