import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GameStatus, PieceColor } from "@shared/schema";

interface GameOverModalProps {
  isOpen: boolean;
  gameStatus: GameStatus;
  currentPlayer: PieceColor;
  onNewGame: () => void;
  onReviewGame: () => void;
}

export function GameOverModal({ 
  isOpen, 
  gameStatus, 
  currentPlayer, 
  onNewGame, 
  onReviewGame 
}: GameOverModalProps) {
  const getGameResult = () => {
    switch (gameStatus) {
      case 'checkmate':
        return {
          icon: '🏆',
          title: 'Checkmate!',
          description: `${currentPlayer === 'white' ? 'Black' : 'White'} wins by checkmate`
        };
      case 'stalemate':
        return {
          icon: '🤝',
          title: 'Stalemate!',
          description: 'Game ended in a draw'
        };
      case 'draw':
        return {
          icon: '🤝',
          title: 'Draw!',
          description: 'Game ended in a draw'
        };
      default:
        return {
          icon: '🎮',
          title: 'Game Over',
          description: 'Game has ended'
        };
    }
  };

  const result = getGameResult();

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md mx-4" data-testid="game-over-modal">
        <DialogHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">{result.icon}</div>
            <DialogTitle className="text-2xl font-bold mb-2" data-testid="game-result-title">
              {result.title}
            </DialogTitle>
            <p className="text-muted-foreground mb-6" data-testid="game-result-description">
              {result.description}
            </p>
          </div>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button 
            onClick={onNewGame}
            className="w-full"
            data-testid="button-new-game-modal"
          >
            New Game
          </Button>
          <Button 
            variant="secondary"
            onClick={onReviewGame}
            className="w-full"
            data-testid="button-review-game"
          >
            Review Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
