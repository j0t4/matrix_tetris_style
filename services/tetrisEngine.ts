import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINOS } from '../constants';
import { Grid, Move, Piece, TetrominoType, AIStrategy } from '../types';

export const createEmptyGrid = (): Grid =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

export const getRandomTetromino = (): TetrominoType => {
  const types = Object.values(TetrominoType);
  return types[Math.floor(Math.random() * types.length)];
};

export const getTetrominoShape = (type: TetrominoType, rotation: number): number[][] => {
  const shapes = TETROMINOS[type];
  return shapes[rotation % shapes.length];
};

// Check if a piece fits at a specific position
export const isValidMove = (grid: Grid, shape: number[][], offsetX: number, offsetY: number): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = x + offsetX;
        const boardY = y + offsetY;

        // Bounds check
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return false;
        }

        // Collision check (only if inside board vertically)
        if (boardY >= 0 && grid[boardY][boardX] !== null) {
          return false;
        }
      }
    }
  }
  return true;
};

// Lock piece into grid
export const lockPiece = (grid: Grid, piece: Piece): Grid => {
  const newGrid = grid.map((row) => [...row]);
  const shape = piece.shape;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardY = y + piece.y;
        if (boardY >= 0 && boardY < BOARD_HEIGHT) {
          newGrid[boardY][x + piece.x] = piece.type;
        }
      }
    }
  }
  return newGrid;
};

// Clear full lines
export const clearLines = (grid: Grid): { grid: Grid; linesCleared: number } => {
  const newGrid = grid.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_HEIGHT - newGrid.length;
  const emptyRows = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(null));
  return {
    grid: [...emptyRows, ...newGrid],
    linesCleared,
  };
};

// --- AI Heuristics ---

interface BoardStats {
  aggregateHeight: number;
  completeLines: number;
  holes: number;
  bumpiness: number;
}

const getBoardStats = (grid: Grid): BoardStats => {
  let aggregateHeight = 0;
  let holes = 0;
  let completeLines = 0;
  let bumpiness = 0;

  const columnHeights = new Array(BOARD_WIDTH).fill(0);

  // Calculate column heights and complete lines
  for (let x = 0; x < BOARD_WIDTH; x++) {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (grid[y][x] !== null) {
        columnHeights[x] = BOARD_HEIGHT - y;
        break;
      }
    }
    aggregateHeight += columnHeights[x];
  }

  // Calculate complete lines
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (grid[y].every((cell) => cell !== null)) {
      completeLines++;
    }
  }

  // Calculate holes
  for (let x = 0; x < BOARD_WIDTH; x++) {
    let blockFound = false;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (grid[y][x] !== null) {
        blockFound = true;
      } else if (blockFound && grid[y][x] === null) {
        holes++;
      }
    }
  }

  // Calculate bumpiness
  for (let x = 0; x < BOARD_WIDTH - 1; x++) {
    bumpiness += Math.abs(columnHeights[x] - columnHeights[x + 1]);
  }

  return { aggregateHeight, completeLines, holes, bumpiness };
};

export const findBestMove = (grid: Grid, pieceType: TetrominoType, strategy: AIStrategy): Move | null => {
  let bestScore = -Infinity;
  let bestMove: Move | null = null;

  const shapes = TETROMINOS[pieceType];

  // Iterate all rotations
  for (let rotation = 0; rotation < shapes.length; rotation++) {
    const shape = shapes[rotation];
    
    // Iterate all columns
    // Standard board is 10 wide. Shape width varies.
    // We try to drop from every possible x
    for (let x = -2; x < BOARD_WIDTH; x++) {
      
      // 1. Find where it lands (drop Y)
      let y = -2;
      if (!isValidMove(grid, shape, x, y)) continue; // Can't even spawn here

      while (isValidMove(grid, shape, x, y + 1)) {
        y++;
      }

      // 2. Simulate the lock
      // Create a temporary grid with the piece locked
      // Optimization: Don't fully clone if possible, but for safety we clone
      const tempGrid = grid.map(row => [...row]);
      
      let validLock = true;
      // Manually lock for performance inside the loop
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
             const by = r + y;
             const bx = c + x;
             if (by < 0 || by >= BOARD_HEIGHT || bx < 0 || bx >= BOARD_WIDTH) {
               // This implies part of the piece is out of bounds after drop?
               // Usually top out.
               // If y is very small, it might be game over move.
             } else {
               tempGrid[by][bx] = pieceType;
             }
          }
        }
      }

      // 3. Calculate Score based on resulting grid
      const stats = getBoardStats(tempGrid);
      
      const score = 
        (stats.aggregateHeight * strategy.weights.aggregateHeight) +
        (stats.completeLines * strategy.weights.completeLines) +
        (stats.holes * strategy.weights.holes) +
        (stats.bumpiness * strategy.weights.bumpiness);

      if (score > bestScore) {
        bestScore = score;
        bestMove = { rotation, x, score };
      }
    }
  }

  return bestMove;
};
