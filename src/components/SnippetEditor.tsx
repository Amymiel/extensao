import { useState, useEffect } from 'react';
import { X, Save, Play, Info, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Snippet, Folder as FolderType } from '@/types';
import { parseSnippetContent } from '@/utils/snippetParser';

interface SnippetEditorProps {
  snippet: Snippet | null;
  folders: FolderType[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTest: (snippet: Snippet) => void;
}

export function SnippetEditor({ snippet, folders, isOpen, onClose, onSave, onTest }: SnippetEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    shortcut: '',
    content: '',
    folderId: null as string | null,
    isActive: true
  });

  useEffect(() => {
    if (snippet) {
      setFormData({
        name: snippet.name,
        shortcut: snippet.shortcut,
        content: snippet.content,
        folderId: snippet.folderId,
        isActive: snippet.isActive
      });
    } else {
      setFormData({
        name: '',
        shortcut: '',
        content: '',
        folderId: null,
        isActive: true
      });
    }
  }, [snippet]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.shortcut.trim()) return;
    
    onSave({
      name: formData.name.trim(),
      shortcut: formData.shortcut.trim(),
      content: formData.content,
      folderId: formData.folderId,
      isActive: formData.isActive
    });
  };

  const handleTest = () => {
    if (snippet) {
      onTest(snippet);
    }
  };

  const parsedContent = parseSnippetContent(formData.content);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            {snippet ? 'Editar Snippet' : 'Criar Novo Snippet'}
          </h2>
          <div className="flex items-center gap-2">
            {snippet && (
              <Button variant="outline" size="sm" onClick={handleTest} className="gap-2">
                <Play className="w-4 h-4" />
                Testar
              </Button>
            )}
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              Salvar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Editor Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Snippet</Label>
                  <Input
                    id="name"
                    placeholder="ex: Assinatura de Email"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortcut">Atalho</Label>
                  <Input
                    id="shortcut"
                    placeholder="ex: /ass"
                    value={formData.shortcut}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortcut: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="folder">Pasta</Label>
                  <Select
                    value={formData.folderId || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      folderId: value === 'none' ? null : value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          Sem Pasta
                        </div>
                      </SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: folder.color }}
                            />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo do Snippet</Label>
                <Textarea
                  id="content"
                  placeholder="Digite o conteúdo do seu snippet aqui..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[200px] font-mono"
                />
              </div>

              {/* Dynamic Fields Info */}
              {parsedContent.fields.length > 0 && (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    Este snippet contém {parsedContent.fields.length} campo(s) dinâmico(s) e {parsedContent.formulas.length} fórmula(s).
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-80 border-l border-border p-6 bg-muted/30 overflow-y-auto">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Ajuda e Visualização
            </h3>

            <div className="space-y-4">
              {/* Syntax Help */}
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Comandos Disponíveis</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {'{formtext: name=nomeCampo}'}
                    </Badge>
                    <p className="text-muted-foreground mt-1">Campo de texto de linha única</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {'{formparagraph: name=nomeCampo}'}
                    </Badge>
                    <p className="text-muted-foreground mt-1">Campo de texto de múltiplas linhas</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {'{formtoggle: name=nomeCampo}'}
                    </Badge>
                    <p className="text-muted-foreground mt-1">Interruptor liga/desliga</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {'{= 2 + 2}'}
                    </Badge>
                    <p className="text-muted-foreground mt-1">Fórmula matemática</p>
                  </div>
                </CardContent>
              </Card>

              {/* Detected Fields */}
              {parsedContent.fields.length > 0 && (
                <Card className="bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Campos Dinâmicos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {parsedContent.fields.map((field) => (
                      <div key={field.id} className="text-xs">
                        <Badge variant="secondary" className="text-xs">
                          {field.type}
                        </Badge>
                        <span className="ml-2 text-muted-foreground">
                          {field.name}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Detected Formulas */}
              {parsedContent.formulas.length > 0 && (
                <Card className="bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Fórmulas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {parsedContent.formulas.map((formula) => (
                      <div key={formula.id} className="text-xs">
                        <Badge variant="outline" className="text-xs font-mono">
                          {formula.expression}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}