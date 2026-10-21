import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SudokuCellProps {
  value: number | null;
  isFixed: boolean;
  isSelected: boolean;
  isError: boolean;
  isSameNumber: boolean;
  onClick: () => void;
}

export const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  isFixed,
  isSelected,
  isError,
  isSameNumber,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'sudoku-cell',
        isFixed && 'sudoku-cell-fixed',
        isSelected && 'sudoku-cell-selected',
        isError && 'sudoku-cell-error',
        isSameNumber && 'sudoku-cell-same-number'
      )}
    >
      <motion.span
        initial={false}
        animate={{ 
          scale: value ? 1 : 0,
          opacity: value ? 1 : 0 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {value ?? ''}
      </motion.span>
    </motion.div>
  );
};
