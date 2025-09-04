import { ChessEngine } from "@/lib/chess-engine";
import { AIDifficulty } from "@/lib/chess-ai";
import { getPieceSymbol, formatTime } from "@/lib/chess-utils";
import { cn } from "@/lib/utils";
import { GameMode } from "@/components/game-mode-selector";

interface GameStatusPanelProps {
  engine: ChessEngine;
  moveTimer: number;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  playerColor: 'white' | 'black';
  isAiThinking: boolean;
}

export function GameStatusPanel({ 
  engine, 
  moveTimer, 
  gameMode, 
  aiDifficulty, 
  playerColor, 
  isAiThinking 
}: GameStatusPanelProps) {
  const currentPlayer = engine.getCurrentPlayer();
  const gameStatus = engine.getGameStatus();
  const capturedPieces = engine.getCapturedPieces();

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'check':
        return `${currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
      case 'checkmate':
        return `Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
      case 'stalemate':
        return 'Stalemate! Game is a draw.';
      case 'draw':
        return 'Game ended in a draw.';
      default:
        return 'Game in progress';
    }
  };

  const getStatusColor = () => {
    switch (gameStatus) {
      case 'check':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'checkmate':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'stalemate':
      case 'draw':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Game Status</h2>
      
      {/* Game Mode Info */}
      {gameMode === 'human-vs-ai' && (
        <div className="mb-6 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Game Mode:</span>
            <span className="text-sm">🤖 vs 👤</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI Difficulty:</span>
            <span className="text-sm capitalize font-semibold text-primary">
              {aiDifficulty}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">You play as:</span>
            <span className="text-sm flex items-center gap-1">
              {playerColor === 'white' ? '♔' : '♚'}
              <span className="capitalize">{playerColor}</span>
            </span>
          </div>
        </div>
      )}

      {/* Current Turn Indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "w-4 h-4 border-2 border-gray-800 rounded-full",
            currentPlayer === 'white' ? "bg-white ring-2 ring-primary" : "bg-white"
          )} />
          <span className={cn(
            "font-medium flex items-center gap-2",
            currentPlayer === 'white' ? "text-primary" : "text-muted-foreground"
          )} data-testid="white-player-indicator">
            {gameMode === 'human-vs-ai' && playerColor === 'white' ? '👤' : '♔'} White to move
            {gameMode === 'human-vs-ai' && currentPlayer === 'white' && playerColor !== 'white' && isAiThinking && (
              <span className="text-xs animate-pulse">thinking...</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-4 h-4 rounded-full",
            currentPlayer === 'black' ? "bg-gray-800 ring-2 ring-primary" : "bg-gray-800"
          )} />
          <span className={cn(
            "font-medium flex items-center gap-2",
            currentPlayer === 'black' ? "text-primary" : "text-muted-foreground"
          )} data-testid="black-player-indicator">
            {gameMode === 'human-vs-ai' && playerColor === 'black' ? '👤' : '🤖'} Black to move
            {gameMode === 'human-vs-ai' && currentPlayer === 'black' && playerColor !== 'black' && isAiThinking && (
              <span className="text-xs animate-pulse">thinking...</span>
            )}
          </span>
        </div>
      </div>

      {/* Game State Messages */}
      <div className="mb-6">
        <div className={cn(
          "p-3 rounded-lg border",
          getStatusColor()
        )}>
          <p className="text-sm font-medium" data-testid="game-status-message">
            {getStatusMessage()}
          </p>
        </div>
      </div>

      {/* Captured Pieces */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Captured Pieces</h3>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">White:</span>
            <div className="flex flex-wrap gap-1 mt-1" data-testid="captured-white-pieces">
              {capturedPieces.white.map((piece, index) => (
                <span key={index} className="text-lg">
                  {getPieceSymbol(piece)}
                </span>
              ))}
              {capturedPieces.white.length === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Black:</span>
            <div className="flex flex-wrap gap-1 mt-1" data-testid="captured-black-pieces">
              {capturedPieces.black.map((piece, index) => (
                <span key={index} className="text-lg">
                  {getPieceSymbol(piece)}
                </span>
              ))}
              {capturedPieces.black.length === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Move Timer */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Move Timer</h3>
        <div className="text-2xl font-mono text-center py-2 bg-muted rounded-lg" data-testid="move-timer">
          {formatTime(moveTimer)}
        </div>
      </div>
    </div>
  );
}
