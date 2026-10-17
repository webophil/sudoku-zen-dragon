import React from 'react';
import { Difficulty } from '@/lib/sudoku';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, AlertCircle, RefreshCw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
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
    <div className="flex flex-col gap-6 w-full lg:w-72">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Difficulté
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {difficulties.map((diff) => (
            <Button
              key={diff.value}
              variant={difficulty === diff.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDifficultyChange(diff.value)}
              className="capitalize"
            >
              {diff.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="w-4 h-4" />
              Temps
            </div>
            <span className="font-mono font-bold text-lg">{formatTime(time)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              Erreurs
            </div>
            <span className={cn("font-bold text-lg", errors >= 3 && "text-destructive")}>
              {errors} / 3
            </span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onNewGame} className="w-full gap-2 py-6 text-lg">
        <RefreshCw className="w-5 h-5" />
        Nouvelle Grille
      </Button>

      {isGameWon && (
        <Card className="bg-primary text-primary-foreground border-none shadow-xl">
          <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
            <Trophy className="w-12 h-12 mb-2 text-yellow-500 animate-bounce" />
            <h3 className="text-xl font-bold">Victoire !</h3>
            <p className="text-sm opacity-90">Félicitations, vous avez dompté le dragon !</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
