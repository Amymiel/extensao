import { Edit, Copy, Trash2, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Snippet } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (snippetId: string) => void;
  onRun: (snippet: Snippet) => void;
  onCopy: (content: string) => void;
}

export function SnippetCard({ snippet, onEdit, onDelete, onRun, onCopy }: SnippetCardProps) {
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 border border-border hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate text-foreground">
              {snippet.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {snippet.shortcut}
              </Badge>
              {!snippet.isActive && (
                <Badge variant="outline" className="text-muted-foreground">
                  Inativo
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRun(snippet)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(snippet.content)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(snippet)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(snippet.id)}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm text-muted-foreground border">
            {truncateContent(snippet.content)}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                Atualizado {formatDistanceToNow(snippet.updatedAt, { addSuffix: true, locale: { 
                  formatDistance: (token: string, count: number) => {
                    const formatDistanceLocale: Record<string, string> = {
                      lessThanXSeconds: 'menos de {{count}} segundo{{count !== 1 ? "s" : ""}}',
                      xSeconds: '{{count}} segundo{{count !== 1 ? "s" : ""}}',
                      halfAMinute: 'meio minuto',
                      lessThanXMinutes: 'menos de {{count}} minuto{{count !== 1 ? "s" : ""}}',
                      xMinutes: '{{count}} minuto{{count !== 1 ? "s" : ""}}',
                      aboutXHours: 'cerca de {{count}} hora{{count !== 1 ? "s" : ""}}',
                      xHours: '{{count}} hora{{count !== 1 ? "s" : ""}}',
                      xDays: '{{count}} dia{{count !== 1 ? "s" : ""}}',
                      aboutXWeeks: 'cerca de {{count}} semana{{count !== 1 ? "s" : ""}}',
                      xWeeks: '{{count}} semana{{count !== 1 ? "s" : ""}}',
                      aboutXMonths: 'cerca de {{count}} mês{{count !== 1 ? "es" : ""}}',
                      xMonths: '{{count}} mês{{count !== 1 ? "es" : ""}}',
                      aboutXYears: 'cerca de {{count}} ano{{count !== 1 ? "s" : ""}}',
                      xYears: '{{count}} ano{{count !== 1 ? "s" : ""}}',
                      overXYears: 'mais de {{count}} ano{{count !== 1 ? "s" : ""}}',
                      almostXYears: 'quase {{count}} ano{{count !== 1 ? "s" : ""}}',
                    };
                    
                    const result = formatDistanceLocale[token] || token;
                    return result.replace('{{count}}', String(count));
                  }
                } })}
              </span>
            </div>
            <div className="text-right">
              <span className="font-medium">{snippet.content.length}</span> caracteres
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}