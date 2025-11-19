export enum TetrominoType {
  I = 'I',
  O = 'O',
  T = 'T',
  S = 'S',
  Z = 'Z',
  J = 'J',
  L = 'L',
}

export type Grid = (string | null)[][];

export interface Piece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  rotation: number;
}

export interface GameState {
  grid: Grid;
  activePiece: Piece | null;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  nextPieceType: TetrominoType;
}

export interface AIStrategy {
  id: string;
  name: string;
  description: string;
  weights: {
    aggregateHeight: number;
    completeLines: number;
    holes: number;
    bumpiness: number;
  };
  speedMs: number;
}

export interface Move {
  rotation: number;
  x: number;
  score: number;
}
