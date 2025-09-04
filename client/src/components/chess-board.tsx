import { ChessSquare } from "./chess-square";
import { ChessEngine } from "@/lib/chess-engine";
import { getSquareNotation } from "@/lib/chess-utils";

interface ChessBoardProps {
  engine: ChessEngine;
  selectedSquare: string | null;
  validMoves: string[];
  onSquareClick: (square: string) => void;
}

export function ChessBoard({ engine, selectedSquare, validMoves, onSquareClick }: ChessBoardProps) {
  const board = engine.getBoard();
  const currentPlayer = engine.getCurrentPlayer();
  const gameStatus = engine.getGameStatus();

  // Find king position if in check
  const kingInCheckSquare = gameStatus === 'check' ? (() => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === currentPlayer) {
          return getSquareNotation(row, col);
        }
      }
    }
    return null;
  })() : null;

  return (
    <div className="bg-card rounded-xl shadow-xl border border-border p-6">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">♜ Black</span>
        <span className="text-sm text-muted-foreground">8x8 Board</span>
      </div>
      
      <div className="grid grid-cols-8 border-2 border-gray-800 rounded-lg overflow-hidden" data-testid="chess-board">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const square = getSquareNotation(rowIndex, colIndex);
            const isSelected = selectedSquare === square;
            const isValidMove = validMoves.includes(square) && !piece;
            const isValidCapture = validMoves.includes(square) && !!piece;
            const isInCheck = kingInCheckSquare === square;

            return (
              <ChessSquare
                key={square}
                row={rowIndex}
                col={colIndex}
                piece={piece}
                isSelected={isSelected}
                isValidMove={isValidMove}
                isValidCapture={isValidCapture}
                isInCheck={isInCheck}
                onClick={() => onSquareClick(square)}
                square={square}
              />
            );
          })
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">♔ White</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>A-H</span>
          <span>•</span>
          <span>1-8</span>
        </div>
      </div>
    </div>
  );
}
