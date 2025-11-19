import { useState, useEffect, useRef, useCallback } from 'react';
import { AIStrategy, GameState, TetrominoType } from '../types';
import { BOARD_WIDTH, TETROMINOS } from '../constants';
import { 
  createEmptyGrid, 
  getRandomTetromino, 
  getTetrominoShape, 
  isValidMove, 
  lockPiece, 
  clearLines,
  findBestMove 
} from '../services/tetrisEngine';

export const useTetrisGame = (strategy: AIStrategy, isPlaying: boolean) => {
  const [gameState, setGameState] = useState<GameState>({
    grid: createEmptyGrid(),
    activePiece: null,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    nextPieceType: getRandomTetromino(),
  });

  // Refs to access current state inside timeouts without dependency loops
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const spawnPiece = useCallback(() => {
    const type = stateRef.current.nextPieceType;
    const nextType = getRandomTetromino();
    
    const newPiece = {
      type,
      shape: getTetrominoShape(type, 0),
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      rotation: 0,
    };

    // Check collision on spawn (Game Over Condition 1)
    if (!isValidMove(stateRef.current.grid, newPiece.shape, newPiece.x, newPiece.y)) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      activePiece: newPiece,
      nextPieceType: nextType,
    }));
  }, []);

  const executeBestMove = useCallback(() => {
    const currentState = stateRef.current;
    // Safety check
    if (currentState.gameOver || !currentState.activePiece) return;

    // AI Calculation
    const move = findBestMove(currentState.grid, currentState.activePiece.type, strategy);

    if (move) {
      // Immediate drop to position (Instant play style for "AI" feel)
      // 1. Rotate
      const rotatedShape = getTetrominoShape(currentState.activePiece.type, move.rotation);
      
      // 2. Drop Calculation
      let dropY = currentState.activePiece.y;
      while (isValidMove(currentState.grid, rotatedShape, move.x, dropY + 1)) {
        dropY++;
      }

      const finalPiece = {
        ...currentState.activePiece,
        rotation: move.rotation,
        shape: rotatedShape,
        x: move.x,
        y: dropY
      };

      // Lock
      const gridWithPiece = lockPiece(currentState.grid, finalPiece);
      const { grid: clearedGrid, linesCleared } = clearLines(gridWithPiece);
      
      // Score calculation (classic Nintendo scoring)
      const points = [0, 40, 100, 300, 1200];
      const newScore = currentState.score + (points[linesCleared] * currentState.level);

      setGameState(prev => ({
        ...prev,
        grid: clearedGrid,
        score: newScore,
        lines: prev.lines + linesCleared,
        activePiece: null // Ready for next spawn
      }));
    } else {
      // No valid move found - The AI cannot place the piece (Game Over Condition 2)
      setGameState(prev => ({ ...prev, gameOver: true }));
    }
  }, [strategy]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || stateRef.current.gameOver) return;

    const tick = () => {
      // Double check game over state before proceeding
      if (stateRef.current.gameOver) return;

      if (!stateRef.current.activePiece) {
        spawnPiece();
      } else {
        executeBestMove();
      }
    };

    const intervalId = setInterval(tick, strategy.speedMs);
    return () => clearInterval(intervalId);
  }, [isPlaying, strategy.speedMs, spawnPiece, executeBestMove]);

  const resetGame = () => {
    setGameState({
      grid: createEmptyGrid(),
      activePiece: null,
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      nextPieceType: getRandomTetromino(),
    });
  };

  return { gameState, resetGame };
};