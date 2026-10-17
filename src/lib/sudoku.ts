export type Difficulty = 'zen' | 'expert' | 'maitre' | 'dragon';

export interface SudokuState {
  grid: (number | null)[][];
  solution: number[][];
  fixed: boolean[][];
  difficulty: Difficulty;
}

const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  zen: 50,
  expert: 38,
  maitre: 30,
  dragon: 24,
};

export function isValid(grid: (number | null)[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

function solve(grid: (number | null)[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solve(grid)) return true;
            grid[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function fillGrid(grid: (number | null)[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generateSudoku(difficulty: Difficulty): SudokuState {
  const fullGrid: (number | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
  fillGrid(fullGrid);

  const solution = fullGrid.map(row => [...row]) as number[][];
  const puzzle = fullGrid.map(row => [...row]);
  const fixed = Array.from({ length: 9 }, () => Array(9).fill(true));

  const cluesToRemove = 81 - DIFFICULTY_CLUES[difficulty];
  let removed = 0;

  while (removed < cluesToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      fixed[row][col] = false;
      removed++;
    }
  }

  return {
    grid: puzzle,
    solution,
    fixed,
    difficulty,
  };
}
