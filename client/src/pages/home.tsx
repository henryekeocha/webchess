import { useState, useEffect } from "react";
import { ChessEngine } from "@/lib/chess-engine";
import { ChessAI, AIDifficulty } from "@/lib/chess-ai";
import { ChessBoard } from "@/components/chess-board";
import { GameStatusPanel } from "@/components/game-status-panel";
import { MoveHistoryPanel } from "@/components/move-history-panel";
import { GameOverModal } from "@/components/game-over-modal";
import { GameModeSelector, GameMode } from "@/components/game-mode-selector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [engine] = useState(() => new ChessEngine());
  const [ai, setAi] = useState<ChessAI | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [gameKey, setGameKey] = useState(0); // Force re-render on new game
  const [moveTimer, setMoveTimer] = useState(600); // 10 minutes
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isGameModeSelectorOpen, setIsGameModeSelectorOpen] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('human-vs-human');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewPosition, setReviewPosition] = useState(0);
  const [reviewEngine, setReviewEngine] = useState<ChessEngine | null>(null);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setMoveTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameKey]);

  // Check for game over
  useEffect(() => {
    const gameStatus = engine.getGameStatus();
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'draw') {
      setIsGameOverModalOpen(true);
    }
  }, [engine, gameKey]);

  // AI move calculation
  useEffect(() => {
    const makeAiMove = async () => {
      if (gameMode === 'human-vs-ai' && ai && engine.getCurrentPlayer() !== playerColor && !isAiThinking) {
        const gameStatus = engine.getGameStatus();
        if (gameStatus === 'playing' || gameStatus === 'check') {
          setIsAiThinking(true);
          
          // Add delay for AI thinking animation
          setTimeout(() => {
            const bestMove = ai.getBestMove();
            if (bestMove) {
              const success = engine.makeMove(bestMove.from, bestMove.to);
              if (success) {
                setGameKey(prev => prev + 1);
                const newGameStatus = engine.getGameStatus();
                if (newGameStatus === 'check') {
                  toast({
                    title: "Check!",
                    description: `${engine.getCurrentPlayer() === 'white' ? 'White' : 'Black'} king is in check`,
                  });
                }
              }
            }
            setIsAiThinking(false);
          }, 800); // AI thinking delay
        }
      }
    };

    makeAiMove();
  }, [gameKey, gameMode, ai, playerColor, engine, isAiThinking, toast]);

  const handleSquareClick = (square: string) => {
    // Don't allow moves in review mode
    if (isReviewMode) {
      return;
    }
    
    // Don't allow moves when AI is thinking or when it's AI's turn
    if (isAiThinking || (gameMode === 'human-vs-ai' && engine.getCurrentPlayer() !== playerColor)) {
      return;
    }

    if (selectedSquare === null) {
      // Select a piece
      const moves = engine.getValidMoves(square);
      if (moves.length > 0) {
        setSelectedSquare(square);
        setValidMoves(moves);
      }
    } else if (selectedSquare === square) {
      // Deselect
      setSelectedSquare(null);
      setValidMoves([]);
    } else if (validMoves.includes(square)) {
      // Make a move
      const success = engine.makeMove(selectedSquare, square);
      if (success) {
        setSelectedSquare(null);
        setValidMoves([]);
        setGameKey(prev => prev + 1); // Force re-render
        
        const gameStatus = engine.getGameStatus();
        if (gameStatus === 'check') {
          toast({
            title: "Check!",
            description: `${engine.getCurrentPlayer() === 'white' ? 'White' : 'Black'} king is in check`,
          });
        }
      }
    } else {
      // Select new piece
      const moves = engine.getValidMoves(square);
      if (moves.length > 0) {
        setSelectedSquare(square);
        setValidMoves(moves);
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  };

  const handleGameModeSelect = (modeInfo: { mode: GameMode; aiDifficulty?: AIDifficulty }) => {
    setGameMode(modeInfo.mode);
    if (modeInfo.aiDifficulty) {
      setAiDifficulty(modeInfo.aiDifficulty);
      setAi(new ChessAI(engine, modeInfo.aiDifficulty));
    } else {
      setAi(null);
    }
    setPlayerColor('white'); // Player always plays white against AI
    handleNewGame();
  };

  const handleNewGame = () => {
    setIsGameModeSelectorOpen(true);
  };

  const startNewGame = () => {
    engine.resetGame();
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveTimer(600);
    setGameKey(prev => prev + 1);
    setIsGameOverModalOpen(false);
    setIsAiThinking(false);
    setIsReviewMode(false);
    setReviewPosition(0);
    setReviewEngine(null);
    
    const modeText = gameMode === 'human-vs-ai' 
      ? `Playing against AI (${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)})`
      : 'Human vs Human mode';
    
    toast({
      title: "New Game Started",
      description: modeText,
    });
  };

  const handleReset = () => {
    startNewGame();
  };

  const handleOfferDraw = () => {
    toast({
      title: "Draw Offered",
      description: "Draw offer has been made",
    });
  };

  const handleResign = () => {
    toast({
      title: "Game Resigned",
      description: `${engine.getCurrentPlayer() === 'white' ? 'White' : 'Black'} has resigned`,
    });
    setIsGameOverModalOpen(true);
  };

  const handleReviewGame = () => {
    setIsGameOverModalOpen(false);
    setIsReviewMode(true);
    setReviewPosition(0);
    
    // Create a copy of the current game for review
    const reviewEng = new ChessEngine();
    setReviewEngine(reviewEng);
    
    toast({
      title: "Review Mode",
      description: "Use the navigation buttons to review moves. Click 'New Game' to exit review.",
    });
  };

  const handleMoveNavigation = (action: 'start' | 'prev' | 'next' | 'end') => {
    if (!reviewEngine) return;
    
    const moveHistory = engine.getMoveHistory();
    let newPosition = reviewPosition;
    
    switch (action) {
      case 'start':
        newPosition = 0;
        break;
      case 'prev':
        newPosition = Math.max(0, reviewPosition - 1);
        break;
      case 'next':
        newPosition = Math.min(moveHistory.length, reviewPosition + 1);
        break;
      case 'end':
        newPosition = moveHistory.length;
        break;
    }
    
    // Rebuild the game state up to the new position
    reviewEngine.resetGame();
    for (let i = 0; i < newPosition; i++) {
      const move = moveHistory[i];
      reviewEngine.makeMove(move.from, move.to);
    }
    
    setReviewPosition(newPosition);
    setGameKey(prev => prev + 1); // Force re-render
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-primary" data-testid="game-title">♔ Chess Master</h1>
              <div className="flex items-center gap-2">
                {isReviewMode && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    📖 Review Mode ({reviewPosition}/{engine.getMoveHistory().length})
                  </span>
                )}
                {!isReviewMode && gameMode === 'human-vs-ai' && (
                  <>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                      🤖 AI ({aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)})
                    </span>
                    {isAiThinking && (
                      <span className="text-sm text-muted-foreground animate-pulse">
                        AI is thinking...
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleNewGame}
                data-testid="button-new-game"
              >
                New Game
              </Button>
              <Button 
                variant="secondary"
                onClick={handleReset}
                data-testid="button-reset"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Game Status Panel */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <GameStatusPanel 
              engine={engine}
              moveTimer={moveTimer}
              gameMode={gameMode}
              aiDifficulty={aiDifficulty}
              playerColor={playerColor}
              isAiThinking={isAiThinking}
              key={gameKey}
            />
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-2 order-1 lg:order-2 flex justify-center">
            <ChessBoard
              engine={isReviewMode ? reviewEngine! : engine}
              selectedSquare={isReviewMode ? null : selectedSquare}
              validMoves={isReviewMode ? [] : validMoves}
              onSquareClick={handleSquareClick}
              key={gameKey}
            />
          </div>

          {/* Move History Panel */}
          <div className="lg:col-span-1 order-3">
            <MoveHistoryPanel
              engine={engine}
              onOfferDraw={handleOfferDraw}
              onResign={handleResign}
              isReviewMode={isReviewMode}
              reviewPosition={reviewPosition}
              onMoveNavigation={handleMoveNavigation}
              key={gameKey}
            />
          </div>
        </div>

        {/* Mobile-specific game controls */}
        <div className="lg:hidden mt-6">
          <div className="bg-card rounded-xl shadow-lg border border-border p-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="secondary"
                data-testid="button-undo-mobile"
              >
                ↩ Undo
              </Button>
              <Button 
                variant="outline"
                data-testid="button-hint-mobile"
              >
                💡 Hint
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        gameStatus={engine.getGameStatus()}
        currentPlayer={engine.getCurrentPlayer()}
        onNewGame={startNewGame}
        onReviewGame={handleReviewGame}
      />
      
      {/* Game Mode Selector */}
      <GameModeSelector
        isOpen={isGameModeSelectorOpen}
        onOpenChange={setIsGameModeSelectorOpen}
        onModeSelect={handleGameModeSelect}
      />
    </div>
  );
}
