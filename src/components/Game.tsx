import React, { useState, useEffect, useCallback } from 'react';
import { SudokuGrid } from './SudokuGrid';
import { Sidebar } from './Sidebar';
import { Keypad } from './Keypad';
import { Difficulty, generateSudoku, SudokuState } from '@/lib/sudoku';
import { toast } from 'sonner';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<SudokuState | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [errorCells, setErrorCells] = useState<[number, number][]>([]);

  const startNewGame = useCallback((difficulty: Difficulty = gameState?.difficulty || 'zen') => {
    const newState = generateSudoku(difficulty);
    setGameState(newState);
    setSelectedCell(null);
    setErrors(0);
    setTime(0);
    setIsGameOver(false);
    setIsGameWon(false);
    setErrorCells([]);
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

  const handleNumberInput = (num: number) => {
    if (!gameState || !selectedCell || isGameOver || isGameWon) return;
    const [r, c] = selectedCell;
    if (gameState.fixed[r][c]) return;

    // Check if correct
    if (gameState.solution[r][c] === num) {
      const newGrid = [...gameState.grid.map(row => [...row])];
      newGrid[r][c] = num;
      setGameState({ ...gameState, grid: newGrid });
      
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

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-center mb-4">
          Sudoku <span className="text-muted-foreground">Zen</span> Dragon
        </h1>
        
        <SudokuGrid
          grid={gameState.grid}
          fixed={gameState.fixed}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          errorCells={errorCells}
        />
        
        <Keypad onNumberClick={handleNumberInput} onClearClick={handleClear} />
      </div>

      <Sidebar
        difficulty={gameState.difficulty}
        onDifficultyChange={handleDifficultyChange}
        errors={errors}
        time={time}
        onNewGame={() => startNewGame(gameState.difficulty)}
        isGameWon={isGameWon}
      />
    </div>
  );
};
