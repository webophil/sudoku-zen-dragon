import React from 'react';
import { SudokuCell } from './SudokuCell';
import { motion } from 'framer-motion';

interface SudokuGridProps {
  grid: (number | null)[][];
  fixed: boolean[][];
  selectedCell: [number, number] | null;
  onCellClick: (row: number, col: number) => void;
  errorCells: [number, number][];
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({
  grid,
  fixed,
  selectedCell,
  onCellClick,
  errorCells,
}) => {
  const isSelected = (r: number, c: number) => 
    selectedCell?.[0] === r && selectedCell?.[1] === c;

  const isError = (r: number, c: number) =>
    errorCells.some(([er, ec]) => er === r && ec === c);

  const isSameNumber = (r: number, c: number) => {
    if (!selectedCell) return false;
    const selectedValue = grid[selectedCell[0]][selectedCell[1]];
    return selectedValue !== null && grid[r][c] === selectedValue;
  };

  return (
    <motion.div 
      className="sudoku-grid w-full max-w-[500px] shadow-2xl rounded-sm overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {grid.map((row, r) =>
        row.map((val, c) => (
          <SudokuCell
            key={`${r}-${c}`}
            value={val}
            isFixed={fixed[r][c]}
            isSelected={isSelected(r, c)}
            isError={isError(r, c)}
            isSameNumber={isSameNumber(r, c)}
            onClick={() => onCellClick(r, c)}
          />
        ))
      )}
    </motion.div>
  );
};
