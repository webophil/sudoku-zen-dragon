import React, { useState, useEffect, useCallback } from 'react';
import { SudokuGrid } from './SudokuGrid';
import { Sidebar } from './Sidebar';
import { Keypad } from './Keypad';
import { Difficulty, generateSudoku, SudokuState } from '@/lib/sudoku';
import { toast } from 'sonner';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<SudokuState | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [errorCells, setErrorCells] = useState<[number, number][]>([]);
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
  const [, setHintCell] = useState<[number, number] | null>(null);

  const startNewGame = useCallback((difficulty: Difficulty = gameState?.difficulty || 'zen') => {
    const newState = generateSudoku(difficulty);
    setGameState(newState);
    setSelectedCell(null);
    setErrors(0);
    setTime(0);
    setIsGameOver(false);
    setIsGameWon(false);
    setErrorCells([]);
    setHighlightedNumber(null);
  }, [gameState?.difficulty]);

  useEffect(() => {
    startNewGame('zen');
  }, []);

  useEffect(() => {
    if (isGameOver || isGameWon) return;
    const interval = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isGameWon]);

  const handleCellClick = (row: number, col: number) => {
    if (isGameOver || isGameWon) return;
    setSelectedCell([row, col]);
  };

  const handleHint = () => {
    if (!gameState || isGameOver || isGameWon) return;
    const selected = selectedCell && !gameState.fixed[selectedCell[0]][selectedCell[1]] &&
      gameState.grid[selectedCell[0]][selectedCell[1]] === null ? selectedCell : null;
    const nextCell = selected ?? gameState.grid.flatMap((row, r) =>
      row.map((value, c) => value === null ? [r, c] as [number, number] : null)
    ).find((cell): cell is [number, number] => cell !== null);

    if (!nextCell) {
      toast.info('La grille est déjà complétée.');
      return;
    }

    const [row, col] = nextCell;
    setSelectedCell(nextCell);
    setHintCell(nextCell);
    toast.info(`Indice : ligne ${row + 1}, colonne ${col + 1} — placez le ${gameState.solution[row][col]}.`);
  };

  const handleNumberInput = (num: number) => {
    if (!gameState || !selectedCell || isGameOver || isGameWon) return;
    const [r, c] = selectedCell;
    if (gameState.fixed[r][c]) return;

    // Check if correct
    if (gameState.solution[r][c] === num) {
      const newGrid = [...gameState.grid.map(row => [...row])];
      newGrid[r][c] = num;
      setGameState({ ...gameState, grid: newGrid });
      setHighlightedNumber(num);
      
      // Check if win
      const isWon = newGrid.every((row, rIdx) => 
        row.every((val, cIdx) => val === gameState.solution[rIdx][cIdx])
      );
      if (isWon) {
        setIsGameWon(true);
        toast.success('Victoire ! Vous avez terminé la grille.');
      }
    } else {
      setErrors(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setIsGameOver(true);
          toast.error('Partie terminée ! Trop d\'erreurs.');
        }
        return newCount;
      });
      setErrorCells(prev => [...prev, [r, c]]);
      setTimeout(() => {
        setErrorCells(prev => prev.filter(([er, ec]) => er !== r || ec !== c));
      }, 1000);
    }
  };

  const handleClear = () => {
    if (!gameState || !selectedCell || isGameOver || isGameWon) return;
    const [r, c] = selectedCell;
    if (gameState.fixed[r][c]) return;

    const newGrid = [...gameState.grid.map(row => [...row])];
    newGrid[r][c] = null;
    setGameState({ ...gameState, grid: newGrid });
  };

  const handleDifficultyChange = (diff: Difficulty) => {
    startNewGame(diff);
  };

  if (!gameState) return null;

  const hasMovesLeft = gameState.grid.some(row => row.some(value => value === null));
  const numberCounts = gameState.grid.flat().reduce((counts, value) => {
    if (value !== null) counts[value] += 1;
    return counts;
  }, Array<number>(10).fill(0));
  const completedNumbers = numberCounts
    .map((count, number) => count === 9 ? number : null)
    .filter((number): number is number => number !== null && number > 0);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-1 items-start gap-6 px-4 py-6 xl:grid-cols-[minmax(210px,250px)_minmax(420px,1fr)_minmax(220px,260px)] xl:gap-8 xl:px-8 xl:py-10">
      <aside className="order-2 flex w-full flex-col gap-5 xl:order-1 xl:pt-24">
        <Sidebar
          panel="stats"
          difficulty={gameState.difficulty}
          onDifficultyChange={handleDifficultyChange}
          errors={errors}
          time={time}
          onNewGame={() => startNewGame(gameState.difficulty)}
          isGameWon={isGameWon}
        />
      </aside>

      <section className="order-1 flex min-w-0 flex-col items-center gap-5 xl:order-2">
        <h1 className="text-center text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          <span className="text-foreground">Sudoku </span>
          <span className="text-[#5ca1d2]">Zen</span>
          <span className="text-foreground"> Dragon</span>
        </h1>
        <SudokuGrid
          grid={gameState.grid}
          fixed={gameState.fixed}
          selectedCell={selectedCell}
          highlightedNumber={highlightedNumber}
          onCellClick={handleCellClick}
          errorCells={errorCells}
        />
      </section>

      <aside className="order-3 flex w-full flex-col gap-4 xl:pt-24">
        <Sidebar
          panel="difficulty"
          difficulty={gameState.difficulty}
          onDifficultyChange={handleDifficultyChange}
          errors={errors}
          time={time}
          onNewGame={() => startNewGame(gameState.difficulty)}
          isGameWon={isGameWon}
        />
        <Keypad
          onNumberClick={handleNumberInput}
          onClearClick={handleClear}
          completedNumbers={completedNumbers}
        />
        <Button onClick={handleHint} disabled={!hasMovesLeft || isGameOver || isGameWon} variant="outline" className="w-full gap-2">
          <Lightbulb className="h-4 w-4" />
          Indice
        </Button>
      </aside>
    </main>
  );
};
