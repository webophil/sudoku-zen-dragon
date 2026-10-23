import React from 'react';
import { Difficulty } from '@/lib/sudoku';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, AlertCircle, RefreshCw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  panel: 'stats' | 'difficulty';
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  errors: number;
  time: number;
  onNewGame: () => void;
  isGameWon: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const Sidebar: React.FC<SidebarProps> = ({
  panel,
  difficulty,
  onDifficultyChange,
  errors,
  time,
  onNewGame,
  isGameWon,
}) => {
  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'zen', label: 'Zen' },
    { value: 'expert', label: 'Expert' },
    { value: 'maitre', label: 'Maître' },
    { value: 'dragon', label: 'Dragon' },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      {panel === 'difficulty' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Difficulté</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {difficulties.map((diff) => (
              <Button
                key={diff.value}
                variant={difficulty === diff.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDifficultyChange(diff.value)}
                aria-pressed={difficulty === diff.value}
                className={cn(
                  'difficulty-button capitalize',
                  difficulty === diff.value ? 'difficulty-button-active' : 'difficulty-button-inactive'
                )}
              >
                {diff.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {panel === 'stats' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  Temps
                </div>
                <span className="font-mono text-lg font-bold">{formatTime(time)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Erreurs
                </div>
                <span className={cn('text-lg font-bold', errors >= 3 && 'text-destructive')}>
                  {errors} / 4
                </span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={onNewGame} className="w-full gap-2 py-6 text-lg">
            <RefreshCw className="h-5 w-5" />
            Nouvelle Grille
          </Button>

          {isGameWon && (
            <Card className="border-none bg-primary text-primary-foreground shadow-xl">
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                <Trophy className="mb-2 h-12 w-12 animate-bounce text-yellow-500" />
                <h3 className="text-xl font-bold">Victoire !</h3>
                <p className="text-sm opacity-90">Félicitations, vous avez dompté le dragon !</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
