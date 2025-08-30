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
    name: 'Modelos de Email',
    color: '#ef4444',
    snippetCount: 3,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Respostas de Suporte',
    color: '#3b82f6',
    snippetCount: 2,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Vendas',
    color: '#10b981',
    snippetCount: 1,
    createdAt: new Date('2024-01-05')
  }
];

const SAMPLE_SNIPPETS: Snippet[] = [
  {
    id: '1',
    name: 'Assinatura de Email Profissional',
    shortcut: '/ass',
    content: 'Atenciosamente,\n\n{formtext: name=nomeCompleto; label=Seu Nome Completo; default=João Silva}\n{formtext: name=cargo; label=Cargo; default=Desenvolvedor de Software}\n{formtext: name=empresa; label=Empresa; default=Tech Corp}\n\nEmail: {formtext: name=email; label=Email; default=joao@techcorp.com}\nTelefone: {formtext: name=telefone; label=Telefone; default=+55 (11) 99999-9999}',
    folderId: '1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    isActive: true
  },
  {
    id: '2',
    name: 'Follow-up de Reunião',
    shortcut: '/followup',
    content: 'Olá {formtext: name=nomeCliente; label=Nome do Cliente},\n\nObrigado por dedicar seu tempo para a reunião comigo {formtext: name=dataReuniao; label=Data da Reunião; default=hoje}. Como discutido, aqui estão os pontos principais:\n\n{formparagraph: name=pontosPrincipais; label=Pontos Principais}\n\n{formtoggle: name=incluirProximosPassos; label=Incluir Próximos Passos; truetext=Próximos passos:\n- {formparagraph: name=proximosPassos; label=Próximos Passos}}\n\nPor favor, me avise se tiver alguma dúvida.\n\nAtenciosamente,\n{formtext: name=nomeRemetente; label=Seu Nome}',
    folderId: '1',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-21'),
    isActive: true
  },
  {
    id: '3',
    name: 'Resposta de Ticket de Suporte',
    shortcut: '/suporte',
    content: 'Olá {formtext: name=nomeCliente; label=Nome do Cliente},\n\nObrigado por entrar em contato com nossa equipe de suporte sobre {formtext: name=assuntoProblema; label=Assunto do Problema}.\n\n{formtoggle: name=problemaResolvido; label=Problema Resolvido; truetext=Ótimas notícias! Consegui resolver seu problema. Aqui está o que fiz:\n\n{formparagraph: name=detalhesResolucao; label=Detalhes da Resolução}; falsetext=Estou investigando seu problema e retornarei em até {formtext: name=tempoResposta; label=Tempo de Resposta; default=24 horas} com uma atualização.}\n\nSe tiver alguma pergunta, não hesite em entrar em contato.\n\nAtenciosamente,\n{formtext: name=agenteSuporte; label=Nome do Agente de Suporte}\nEquipe de Suporte',
    folderId: '2',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-20'),
    isActive: true
  },
  {
    id: '4',
    name: 'Calculadora de Fatura',
    shortcut: '/fatura',
    content: 'Resumo da Fatura\n\nCliente: {formtext: name=nomeCliente; label=Nome do Cliente}\nProjeto: {formtext: name=nomeProjeto; label=Nome do Projeto}\n\nHoras trabalhadas: {formtext: name=horas; label=Horas; default=40}\nValor por hora: R$ {formtext: name=valorHora; label=Valor por Hora; default=150}\n\nSubtotal: R$ {= horas * valorHora}\nImpostos ({formtext: name=taxaImposto; label=Taxa de Imposto %; default=10}%): R$ {= (horas * valorHora) * (taxaImposto / 100)}\nTotal: R$ {= (horas * valorHora) + ((horas * valorHora) * (taxaImposto / 100))}\n\nO pagamento é devido em 30 dias a partir da data da fatura.',
    folderId: '3',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-19'),
    isActive: true
  },
  {
    id: '5',
    name: 'Saudação Rápida',
    shortcut: '/oi',
    content: 'Olá! Como posso ajudá-lo hoje?',
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
        title: 'Snippet atualizado',
        description: `${snippetData.name} foi atualizado com sucesso.`,
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
        title: 'Snippet criado',
        description: `${snippetData.name} foi criado com sucesso.`,
      });
    }
    setIsEditorOpen(false);
    setEditingSnippet(null);
  };

  const handleDeleteSnippet = (snippetId: string) => {
    const snippet = snippets.find(s => s.id === snippetId);
    setSnippets(prev => prev.filter(s => s.id !== snippetId));
    toast({
      title: 'Snippet excluído',
      description: `${snippet?.name || 'Snippet'} foi excluído.`,
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
        title: 'Copiado!',
        description: 'Conteúdo copiado para a área de transferência',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao copiar conteúdo',
        variant: 'destructive',
      });
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Digite o nome da pasta:');
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
        title: 'Pasta criada',
        description: `A pasta ${folderName} foi criada.`,
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
                  {selectedFolderId === null ? 'Todos os Snippets' :
                   selectedFolderId === 'unorganized' ? 'Sem Organização' :
                   folders.find(f => f.id === selectedFolderId)?.name || 'Snippets'}
                </h1>
                <p className="text-muted-foreground">
                  {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''} encontrado{filteredSnippets.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button 
                onClick={handleCreateSnippet}
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Snippet
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
              <h3 className="text-lg font-semibold mb-2">Nenhum snippet encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Tente ajustar seus termos de busca' : 'Crie seu primeiro snippet para começar'}
              </p>
              <Button onClick={handleCreateSnippet} className="bg-gradient-to-r from-primary to-primary-glow">
                <Plus className="w-4 h-4 mr-2" />
                Criar Snippet
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
