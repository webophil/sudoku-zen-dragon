import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateSudoku, canSolveLogically } from '../src/lib/sudoku.ts';

// Independent exhaustive solver, capped at two solutions. It does not use the
// production solver or its candidate/validation helpers.
function countSolutions(input) {
  const grid = input.map(row => [...row]);
  function search() {
    let cell, choices;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== null) continue;
      const used = new Set([...grid[r], ...grid.map(row => row[c])]);
      for (let br = r - r % 3; br < r - r % 3 + 3; br++)
        for (let bc = c - c % 3; bc < c - c % 3 + 3; bc++) used.add(grid[br][bc]);
      const options = [1,2,3,4,5,6,7,8,9].filter(n => !used.has(n));
      if (!options.length) return 0;
      if (!cell || options.length < choices.length) { cell = [r,c]; choices = options; }
    }
    if (!cell) return 1;
    const [r,c] = cell;
    let count = 0;
    for (const n of choices) {
      grid[r][c] = n;
      count += search();
      if (count >= 2) break;
    }
    grid[r][c] = null;
    return Math.min(count, 2);
  }
  return search();
}

function withSeed(seed, fn) {
  const original = Math.random;
  Math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  try { return fn(); } finally { Math.random = original; }
}

test('logical solver accepts forced moves and rejects ambiguity without mutating input', () => {
  const grid = [
    '530070000','600195000','098000060','800060003','400803001',
    '700020006','060000280','000419005','000080079',
  ].map(row => [...row].map(n => Number(n) || null));
  const before = structuredClone(grid);
  assert.equal(canSolveLogically(grid), true);
  assert.deepEqual(grid, before);
  assert.equal(countSolutions(grid), 1);
  assert.equal(canSolveLogically(Array.from({length:9}, () => Array(9).fill(null))), false);
  grid[0][2] = 5;
  assert.equal(canSolveLogically(grid), false);
});

test('all levels produce unique, logically solvable puzzles with consistent game state', () => {
  const targets = {zen:50, expert:38, maitre:30, dragon:24};
  const stats = {};
  for (const [difficulty, target] of Object.entries(targets)) {
    const counts = [];
    let totalMs = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const start = performance.now();
      const state = withSeed(seed, () => generateSudoku(difficulty));
      totalMs += performance.now() - start;
      const snapshot = structuredClone(state);
      assert.equal(state.difficulty, difficulty);
      assert.equal(canSolveLogically(state.grid), true, difficulty + ' seed ' + seed);
      assert.equal(countSolutions(state.grid), 1, difficulty + ' seed ' + seed);
      assert.deepEqual(state, snapshot);
      const count = state.grid.flat().filter(n => n !== null).length;
      assert.ok(count >= target && count < 81);
      counts.push(count);
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        assert.equal(state.fixed[r][c], state.grid[r][c] !== null);
        if (state.fixed[r][c]) assert.equal(state.grid[r][c], state.solution[r][c]);
      }
      const valid = values => assert.deepEqual([...values].sort(), [1,2,3,4,5,6,7,8,9]);
      for (let i = 0; i < 9; i++) {
        valid(state.solution[i]);
        valid(state.solution.map(row => row[i]));
        valid(Array.from({length:9}, (_, j) => state.solution[Math.floor(i/3)*3+Math.floor(j/3)][i%3*3+j%3]));
      }
      state.grid[0][0] = null;
      assert.notEqual(state.solution[0][0], null);
    }
    stats[difficulty] = { samples: counts.length, minClues: Math.min(...counts), maxClues: Math.max(...counts), meanGenerationMs: Math.round(totalMs / counts.length) };
  }
  console.log(stats);
});

test('higher levels remove at least as many clues from the same seeded board', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const states = ['zen','expert','maitre','dragon'].map(d => withSeed(seed, () => generateSudoku(d)));
    for (let i = 1; i < states.length; i++) {
      assert.deepEqual(states[0].solution, states[i].solution);
      assert.ok(states[i].grid.flat().filter(n => n !== null).length <= states[i-1].grid.flat().filter(n => n !== null).length);
    }
  }
});
