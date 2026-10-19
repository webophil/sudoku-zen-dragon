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
      {numbers.map((num) => (
        <motion.div
          key={num}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            className="w-full h-12 text-xl font-medium disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => onNumberClick(num)}
            disabled={completedNumbers.includes(num)}
            aria-label={completedNumbers.includes(num) ? `Le chiffre ${num} est déjà complété` : `Placer le ${num}`}
          >
            {num}
          </Button>
        </motion.div>
      ))}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="col-span-3"
      >
        <Button
          variant="ghost"
          className="w-full h-10 text-sm font-medium text-muted-foreground"
          onClick={onClearClick}
        >
          Effacer
        </Button>
      </motion.div>
    </div>
  );
};
