import React from 'react';
import { GameState, AIStrategy } from '../types';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';

interface TetrisBoardProps {
  gameState: GameState;
  strategy: AIStrategy;
  side: 'left' | 'right';
}

const TetrisBoard: React.FC<TetrisBoardProps> = ({ gameState, strategy, side }) => {
  const { grid, activePiece, score, gameOver } = gameState;

  // Merge active piece into grid for display
  const displayGrid = grid.map(row => [...row]);
  if (activePiece) {
    activePiece.shape.forEach((row, dy) => {
      row.forEach((val, dx) => {
        if (val) {
          const y = activePiece.y + dy;
          const x = activePiece.x + dx;
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            displayGrid[y][x] = activePiece.type;
          }
        }
      });
    });
  }

  // Determine color based on piece type (Classic Neon Matrix Style)
  const getCellColor = (cell: string | null) => {
    if (!cell) return 'bg-black/95'; // Almost opaque black
    
    // Map types to classic neon colors with matrix glow
    switch (cell) {
      case 'I': return 'bg-tetris-i shadow-[0_0_8px_#00FFFF] border border-tetris-i/50 z-10';
      case 'O': return 'bg-tetris-o shadow-[0_0_8px_#FFFF00] border border-tetris-o/50 z-10';
      case 'T': return 'bg-tetris-t shadow-[0_0_8px_#FF00FF] border border-tetris-t/50 z-10';
      case 'S': return 'bg-tetris-s shadow-[0_0_8px_#00FF00] border border-tetris-s/50 z-10';
      case 'Z': return 'bg-tetris-z shadow-[0_0_8px_#FF0000] border border-tetris-z/50 z-10';
      case 'J': return 'bg-tetris-j shadow-[0_0_8px_#0000FF] border border-tetris-j/50 z-10';
      case 'L': return 'bg-tetris-l shadow-[0_0_8px_#FF7F00] border border-tetris-l/50 z-10';
      default: return 'bg-matrix-light';
    }
  };

  return (
    <div className={`relative flex flex-col items-center p-6 border-2 border-matrix-light bg-black/80 backdrop-blur-sm rounded-lg w-full max-w-md mx-auto ${side === 'left' ? 'lg:mr-4' : 'lg:ml-4'} transition-all duration-500 shadow-[0_0_15px_rgba(0,60,0,0.5)]`}>
      
      {/* Header info */}
      <div className="w-full flex justify-between items-end mb-4 border-b border-matrix-light pb-2">
        <div>
          <h2 className="text-xl text-matrix-bright font-bold tracking-wider uppercase">{strategy.name}</h2>
          <p className="text-xs text-matrix-light opacity-80">{strategy.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-matrix-light">SCORE</p>
          <p className="text-2xl font-mono text-matrix-bright">{score.toLocaleString()}</p>
        </div>
      </div>

      {/* The Grid Container */}
      <div className="relative border-4 border-matrix-dark bg-[#001a00] shadow-[0_0_20px_rgba(0,255,65,0.2)] w-full max-w-[300px]">
        
        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm border-2 border-red-500/50 animate-pulse">
            <h3 className="text-5xl font-bold text-red-500 tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,1)]">FAIL</h3>
            <p className="text-sm text-red-400 mt-2 uppercase tracking-wider font-bold">System Halted</p>
            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          </div>
        )}
        
        {/* Grid Board - Aspect Ratio Hack for perfect fit */}
        <div 
            style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
                gap: '1px',
                backgroundColor: '#004d00', // Visible dark green grid lines
            }}
            className="w-full aspect-[1/2]"
        >
          {displayGrid.map((row, y) => 
            row.map((cell, x) => (
              <div 
                key={`${y}-${x}`} 
                className={`w-full h-full relative ${getCellColor(cell)}`}
              >
                {/* Inner decoration for depth */}
                {cell && (
                   <div className="absolute inset-[15%] bg-white/20 rounded-[1px]"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="w-full mt-4 grid grid-cols-2 gap-4 text-xs text-matrix-light font-mono">
        <div>
          <span className="opacity-50">LINES:</span> {gameState.lines}
        </div>
        <div className="text-right">
          <span className="opacity-50">SPEED:</span> {strategy.speedMs}ms
        </div>
      </div>

    </div>
  );
};

export default TetrisBoard;