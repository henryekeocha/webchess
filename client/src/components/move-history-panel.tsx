import { ChessEngine } from "@/lib/chess-engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MoveHistoryPanelProps {
  engine: ChessEngine;
  onOfferDraw: () => void;
  onResign: () => void;
  isReviewMode?: boolean;
  reviewPosition?: number;
  onMoveNavigation?: (action: 'start' | 'prev' | 'next' | 'end') => void;
}

export function MoveHistoryPanel({ 
  engine, 
  onOfferDraw, 
  onResign, 
  isReviewMode = false,
  reviewPosition = 0,
  onMoveNavigation
}: MoveHistoryPanelProps) {
  const moveHistory = engine.getMoveHistory();
  const moveCount = moveHistory.length;

  // Group moves by move number (white and black moves together)
  const groupedMoves: Array<{ moveNumber: number; white: string; black?: string }> = [];
  
  for (let i = 0; i < moveHistory.length; i += 2) {
    const whiteMove = moveHistory[i];
    const blackMove = moveHistory[i + 1];
    
    groupedMoves.push({
      moveNumber: whiteMove.moveNumber,
      white: whiteMove.notation,
      black: blackMove?.notation
    });
  }

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Move History</h2>
      
      {/* Move Counter */}
      <div className="mb-4 p-3 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Moves:</span>
          <span className="font-semibold" data-testid="total-moves">{moveCount}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-muted-foreground">Current Turn:</span>
          <span className="font-semibold" data-testid="current-turn">{Math.ceil(moveCount / 2) + 1}</span>
        </div>
      </div>

      {/* Move List */}
      <div className="move-history max-h-[300px] overflow-y-auto">
        <div className="space-y-1" data-testid="move-history-list">
          {groupedMoves.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No moves yet</p>
          ) : (
            groupedMoves.map((move, index) => {
              const moveIndex = index * 2;
              const isCurrentWhiteMove = isReviewMode && reviewPosition === moveIndex + 1;
              const isCurrentBlackMove = isReviewMode && reviewPosition === moveIndex + 2;
              const isPastMove = isReviewMode && reviewPosition > moveIndex + 1;
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded transition-colors",
                    !isReviewMode && index === groupedMoves.length - 1 && "bg-accent",
                    isReviewMode && (isCurrentWhiteMove || isCurrentBlackMove) && "bg-primary/20 ring-1 ring-primary",
                    !isReviewMode && "hover:bg-muted"
                  )}
                  data-testid={`move-${move.moveNumber}`}
                >
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    {move.moveNumber}.
                  </span>
                  <span className={cn(
                    "font-mono text-sm flex-1",
                    isReviewMode && isCurrentWhiteMove && "font-bold text-primary",
                    isReviewMode && isPastMove && "opacity-60"
                  )}>
                    {move.white}
                  </span>
                  <span className={cn(
                    "font-mono text-sm flex-1",
                    isReviewMode && isCurrentBlackMove && "font-bold text-primary",
                    isReviewMode && isPastMove && moveIndex + 2 < reviewPosition && "opacity-60"
                  )}>
                    {move.black || <span className="text-muted-foreground">...</span>}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Move Navigation */}
      {isReviewMode && (
        <div className="mt-6 space-y-3">
          <div className="text-center mb-2">
            <span className="text-sm text-muted-foreground">
              Position: {reviewPosition} / {moveHistory.length}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => onMoveNavigation?.('start')}
              disabled={reviewPosition === 0}
              data-testid="button-move-start"
            >
              ⏮ Start
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => onMoveNavigation?.('prev')}
              disabled={reviewPosition === 0}
              data-testid="button-move-prev"
            >
              ⏪ Prev
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => onMoveNavigation?.('next')}
              disabled={reviewPosition >= moveHistory.length}
              data-testid="button-move-next"
            >
              Next ⏩
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => onMoveNavigation?.('end')}
              disabled={reviewPosition >= moveHistory.length}
              data-testid="button-move-end"
            >
              End ⏭
            </Button>
          </div>
        </div>
      )}

      {/* Game Actions */}
      {!isReviewMode && (
        <div className="mt-6 space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onOfferDraw}
            data-testid="button-offer-draw"
          >
            Offer Draw
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={onResign}
            data-testid="button-resign"
          >
            Resign Game
          </Button>
        </div>
      )}
      
      {isReviewMode && (
        <div className="mt-6">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              📖 Review Mode Active<br/>
              <span className="text-xs opacity-75">Navigate through moves to analyze the game</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
