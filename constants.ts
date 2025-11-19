import { TetrominoType, AIStrategy } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOS: Record<TetrominoType, number[][][]> = {
  [TetrominoType.I]: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
  ],
  [TetrominoType.O]: [
    [[1, 1], [1, 1]],
  ],
  [TetrominoType.T]: [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]],
  ],
  [TetrominoType.S]: [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]],
  ],
  [TetrominoType.Z]: [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]],
  ],
  [TetrominoType.J]: [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]],
  ],
  [TetrominoType.L]: [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]],
  ],
};

export const AI_STRATEGIES: AIStrategy[] = [
  {
    id: 'architect',
    name: 'The Architect',
    description: 'Balanced. Prioritizes a clean board structure.',
    speedMs: 300,
    weights: {
      aggregateHeight: -0.5,
      completeLines: 0.76,
      holes: -0.36,
      bumpiness: -0.18,
    },
  },
  {
    id: 'smith',
    name: 'Agent Smith',
    description: 'Aggressive. Extremely fast, hates holes, ignores height.',
    speedMs: 100,
    weights: {
      aggregateHeight: -0.1,
      completeLines: 0.5,
      holes: -0.9, // Hates holes
      bumpiness: -0.3,
    },
  },
  {
    id: 'neo',
    name: 'The One',
    description: 'High Risk. Stacks high to get multi-line clears.',
    speedMs: 400,
    weights: {
      aggregateHeight: -0.2, // Tolerates height
      completeLines: 1.5, // Loves lines
      holes: -0.4,
      bumpiness: -0.1,
    },
  },
  {
    id: 'oracle',
    name: 'The Oracle',
    description: 'Predictive. Calculates optimal bumpiness.',
    speedMs: 200,
    weights: {
      aggregateHeight: -0.5,
      completeLines: 0.8,
      holes: -0.5,
      bumpiness: -0.8, // Hates uneven surfaces
    },
  },
];
