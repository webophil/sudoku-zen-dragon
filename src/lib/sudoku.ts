export type Difficulty = 'zen' | 'expert' | 'maitre' | 'dragon';

export interface SudokuState {
  grid: (number | null)[][];
  solution: number[][];
  fixed: boolean[][];
  difficulty: Difficulty;
}

// Clue targets, not quotas: keep extra clues when removing one would require guessing.
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

type Grid = (number | null)[][];

const UNITS: number[][] = [
  ...Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => r * 9 + c)),
  ...Array.from({ length: 9 }, (_, c) => Array.from({ length: 9 }, (_, r) => r * 9 + c)),
  ...Array.from({ length: 9 }, (_, b) => Array.from({ length: 9 }, (_, i) =>
    (Math.floor(b / 3) * 3 + Math.floor(i / 3)) * 9 + (b % 3) * 3 + i % 3)),
];

// Only forced placements: a single candidate in a cell, or a digit with a
// single possible position in a row, column or box. Never consult the solution
// or try a hypothesis. Completing this way also proves uniqueness.
export function canSolveLogically(input: Grid): boolean {
  const grid = input.map(row => [...row]);
  // Reject inconsistent starting grids, including already-filled ones.
  for (const unit of UNITS) {
    const values = unit.map(i => grid[Math.floor(i / 9)][i % 9]).filter(n => n !== null);
    if (new Set(values).size !== values.length) return false;
  }

  while (true) {
    const candidates = Array.from({ length: 81 }, (_, i) => {
      const row = Math.floor(i / 9), col = i % 9;
      return grid[row][col] === null
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => isValid(grid, row, col, n))
        : [];
    });
    let empty = false;
    let placement: [number, number] | undefined;
    for (let i = 0; i < 81; i++) {
      if (grid[Math.floor(i / 9)][i % 9] !== null) continue;
      empty = true;
      if (candidates[i].length === 0) return false;
      if (candidates[i].length === 1) placement = [i, candidates[i][0]];
    }
    if (!empty) return true;
    if (!placement) {
      for (const unit of UNITS) {
        for (let n = 1; n <= 9; n++) {
          if (unit.some(i => grid[Math.floor(i / 9)][i % 9] === n)) continue;
          const positions = unit.filter(i => candidates[i].includes(n));
          if (positions.length === 0) return false;
          if (positions.length === 1) placement = [positions[0], n];
        }
      }
    }
    if (!placement) return false;
    const [index, value] = placement;
    grid[Math.floor(index / 9)][index % 9] = value;
  }
}

function shuffled<T>(values: T[]): T[] {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function fillGrid(grid: (number | null)[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        const nums = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]);
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

  // Each position is tried once, so generation stays bounded even when the
  // target cannot be reached with these logical techniques.
  for (const index of shuffled(Array.from({ length: 81 }, (_, i) => i))) {
    if (removed >= cluesToRemove) break;
    const row = Math.floor(index / 9);
    const col = index % 9;
    const value = puzzle[row][col];
    puzzle[row][col] = null;
    if (canSolveLogically(puzzle)) {
      fixed[row][col] = false;
      removed++;
    } else {
      puzzle[row][col] = value;
    }
  }

  return {
    grid: puzzle,
    solution,
    fixed,
    difficulty,
  };
}
