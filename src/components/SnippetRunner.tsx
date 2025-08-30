import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Snippet } from '@/types';
import { parseSnippetContent, processSnippetContent } from '@/utils/snippetParser';

interface SnippetRunnerProps {
  snippet: Snippet | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SnippetRunner({ snippet, isOpen, onClose }: SnippetRunnerProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (snippet && isOpen) {
      const parsed = parseSnippetContent(snippet.content);
      const initialValues: Record<string, any> = {};
      
      parsed.fields.forEach(field => {
        initialValues[field.name] = field.defaultValue || (field.type === 'formtoggle' ? false : '');
      });
      
      setFieldValues(initialValues);
      setOutput(processSnippetContent(snippet.content, initialValues));
      setCopied(false);
    }
  }, [snippet, isOpen]);

  useEffect(() => {
    if (snippet) {
      setOutput(processSnippetContent(snippet.content, fieldValues));
    }
  }, [fieldValues, snippet]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Snippet output copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen || !snippet) return null;

  const parsedContent = parseSnippetContent(snippet.content);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{snippet.name}</h2>
              <p className="text-sm text-muted-foreground">
                Shortcut: <Badge variant="secondary">{snippet.shortcut}</Badge>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Input Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Fill in the fields</h3>
                
                {parsedContent.fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>This snippet has no dynamic fields.</p>
                    <p className="text-sm mt-1">The output is ready to use!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {parsedContent.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.name}>
                          {field.label || field.name}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        
                        {field.type === 'formtext' && (
                          <Input
                            id={field.name}
                            value={fieldValues[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={`Enter ${field.label || field.name}`}
                          />
                        )}
                        
                        {field.type === 'formparagraph' && (
                          <Textarea
                            id={field.name}
                            value={fieldValues[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={`Enter ${field.label || field.name}`}
                            rows={3}
                          />
                        )}
                        
                        {field.type === 'formtoggle' && (
                          <div className="flex items-center gap-2">
                            <Switch
                              id={field.name}
                              checked={fieldValues[field.name] || false}
                              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {fieldValues[field.name] ? 'Yes' : 'No'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="w-96 border-l border-border p-6 bg-muted/30 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Output</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={`gap-2 transition-all ${copied ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-background p-3 rounded border min-h-[200px]">
                    {output || 'Fill in the fields to see the output...'}
                  </pre>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Characters:</span>
                    <span className="font-medium">{output.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Words:</span>
                    <span className="font-medium">{output.split(/\s+/).filter(w => w.length > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lines:</span>
                    <span className="font-medium">{output.split('\n').length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}