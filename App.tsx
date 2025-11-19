import React, { useState, useEffect, useCallback } from 'react';
import { AI_STRATEGIES } from './constants';
import { AIStrategy } from './types';
import MatrixRain from './components/MatrixRain';
import TetrisBoard from './components/TetrisBoard';
import { useTetrisGame } from './hooks/useTetrisGame';
import { generateMatchCommentary } from './services/geminiService';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [p1Strategy, setP1Strategy] = useState<AIStrategy>(AI_STRATEGIES[0]);
  const [p2Strategy, setP2Strategy] = useState<AIStrategy>(AI_STRATEGIES[1]);
  
  const [commentary, setCommentary] = useState<string>("Initializing simulation parameters...");
  const [gameTime, setGameTime] = useState(0);

  const game1 = useTetrisGame(p1Strategy, isPlaying);
  const game2 = useTetrisGame(p2Strategy, isPlaying);

  // Game Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Commentary Loop using Gemini
  useEffect(() => {
    if (!isPlaying) return;

    // Fetch commentary every 12 seconds or if game over
    const fetchCommentary = async () => {
      if (game1.gameState.gameOver && game2.gameState.gameOver) {
        setCommentary("Simulation Terminated. Both subjects failed.");
        return;
      }

      const text = await generateMatchCommentary(
        p1Strategy.name,
        game1.gameState.score,
        p2Strategy.name,
        game2.gameState.score,
        gameTime
      );
      setCommentary(text);
    };

    const interval = setInterval(fetchCommentary, 12000);
    
    // Initial fetch
    if (gameTime === 1) fetchCommentary();

    return () => clearInterval(interval);
  }, [isPlaying, gameTime, game1.gameState.score, game2.gameState.score, p1Strategy.name, p2Strategy.name, game1.gameState.gameOver, game2.gameState.gameOver]);

  const handleStart = () => {
    if (game1.gameState.gameOver || game2.gameState.gameOver) {
      game1.resetGame();
      game2.resetGame();
      setGameTime(0);
      setCommentary("Rebooting simulation...");
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    game1.resetGame();
    game2.resetGame();
    setGameTime(0);
    setCommentary("System ready.");
  };

  return (
    <div className="h-screen w-full relative font-mono text-matrix-bright flex flex-col overflow-y-auto bg-black">
      <MatrixRain />
      
      {/* UI Layer */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-full pb-40">
        
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,255,65,0.8)] uppercase">
            Neural Tetris
          </h1>
          <p className="text-matrix-light mt-2 text-sm tracking-widest">AI BATTLE SIMULATION v2.6</p>
        </header>

        {/* Control Panel */}
        <div className="bg-black/60 backdrop-blur border border-matrix-light p-4 rounded mb-8 mx-auto w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
          
          {/* P1 Select */}
          <div className="flex flex-col w-full md:w-1/3">
            <label className="text-xs text-matrix-light mb-1">SUBJECT 01 ENGINE</label>
            <select 
              value={p1Strategy.id}
              onChange={(e) => setP1Strategy(AI_STRATEGIES.find(s => s.id === e.target.value) || AI_STRATEGIES[0])}
              className="bg-black border border-matrix-light text-matrix-bright p-2 rounded focus:outline-none focus:border-white transition-colors"
              disabled={isPlaying}
            >
              {AI_STRATEGIES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleStart}
              className={`px-8 py-3 rounded font-bold border transition-all duration-200 uppercase tracking-wider
                ${isPlaying 
                  ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-900/20 shadow-[0_0_10px_rgba(234,179,8,0.4)]' 
                  : 'border-matrix-bright text-matrix-bright hover:bg-matrix-light/20 shadow-[0_0_15px_rgba(0,255,65,0.6)] animate-pulse-fast'
                }`}
            >
              {isPlaying ? 'Pause' : (game1.gameState.gameOver || game2.gameState.gameOver ? 'Reboot' : 'Execute')}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 rounded border border-red-900 text-red-500 hover:bg-red-900/20 uppercase text-sm"
            >
              Abort
            </button>
          </div>

          {/* P2 Select */}
          <div className="flex flex-col w-full md:w-1/3 items-end">
             <label className="text-xs text-matrix-light mb-1 w-full text-right">SUBJECT 02 ENGINE</label>
            <select 
              value={p2Strategy.id}
              onChange={(e) => setP2Strategy(AI_STRATEGIES.find(s => s.id === e.target.value) || AI_STRATEGIES[0])}
              className="bg-black border border-matrix-light text-matrix-bright p-2 rounded focus:outline-none focus:border-white transition-colors w-full text-right"
              disabled={isPlaying}
            >
              {AI_STRATEGIES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Main Battle Area */}
        <div className="flex flex-col lg:flex-row justify-center items-start w-full max-w-6xl mx-auto gap-8 mb-8">
          <TetrisBoard gameState={game1.gameState} strategy={p1Strategy} side="left" />
          
          {/* VS divider for large screens */}
          <div className="hidden lg:flex flex-col items-center justify-center h-[500px]">
             <div className="h-full w-px bg-matrix-light opacity-20"></div>
          </div>

          <TetrisBoard gameState={game2.gameState} strategy={p2Strategy} side="right" />
        </div>

        {/* Commentary Box */}
        <div className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur border-t-2 border-matrix-light p-4 z-50 shadow-[0_-5px_20px_rgba(0,255,65,0.2)]">
          <div className="container mx-auto flex items-center gap-4">
            <div className="w-3 h-3 bg-matrix-bright rounded-full animate-ping shrink-0"></div>
            <p className="text-sm md:text-lg font-mono text-matrix-bright w-full text-center md:text-left truncate">
              <span className="text-matrix-light mr-2 text-xs uppercase tracking-wider">[ORACLE_LOG]:</span>
              {commentary}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;