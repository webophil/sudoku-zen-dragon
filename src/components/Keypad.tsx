import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface KeypadProps {
  onNumberClick: (num: number) => void;
  onClearClick: () => void;
  completedNumbers: number[];
}

export const Keypad: React.FC<KeypadProps> = ({ onNumberClick, onClearClick, completedNumbers }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mx-auto mt-6">
      {numbers.map((num) => {
        const isCompleted = completedNumbers.includes(num);

        return (
          <motion.div
            key={num}
            className="h-12"
            whileHover={isCompleted ? undefined : { scale: 1.05 }}
            whileTap={isCompleted ? undefined : { scale: 0.95 }}
          >
            <Button
              variant="outline"
              className={`${isCompleted ? 'keypad-number-button-completed' : 'keypad-number-button'} w-full h-12 text-xl font-semibold`}
              onClick={() => onNumberClick(num)}
              disabled={isCompleted}
              aria-label={isCompleted ? `Le ${num} est déjà complété` : `Placer le ${num}`}
            >
              <span className="relative z-10">{num}</span>
            </Button>
          </motion.div>
        );
      })}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="col-span-3"
      >
        <Button
          variant="ghost"
          className="hidden w-full h-10 text-sm font-medium text-muted-foreground"
          onClick={onClearClick}
        >
          Effacer
        </Button>
      </motion.div>
    </div>
  );
};
