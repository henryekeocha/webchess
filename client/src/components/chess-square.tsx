import { cn } from "@/lib/utils";
import { ChessPiece } from "@shared/schema";
import { getPieceSymbol, isLightSquare } from "@/lib/chess-utils";

interface ChessSquareProps {
  row: number;
  col: number;
  piece: ChessPiece | null;
  isSelected: boolean;
  isValidMove: boolean;
  isValidCapture: boolean;
  isInCheck: boolean;
  onClick: () => void;
  square: string;
}

export function ChessSquare({
  row,
  col,
  piece,
  isSelected,
  isValidMove,
  isValidCapture,
  isInCheck,
  onClick,
  square
}: ChessSquareProps) {
  const isLight = isLightSquare(row, col);
  
  return (
    <div
      className={cn(
        "chess-square relative flex items-center justify-center cursor-pointer transition-all duration-200 select-none",
        "w-[60px] h-[60px] md:w-[70px] md:h-[70px] text-3xl md:text-4xl",
        isLight ? "bg-slate-100" : "bg-slate-600",
        isSelected && "!bg-amber-300 shadow-[inset_0_0_0_3px_rgb(245,158,11)]",
        isInCheck && "!bg-red-200 shadow-[inset_0_0_0_3px_rgb(239,68,68)]",
        !isSelected && !isInCheck && isLight && "hover:bg-slate-200",
        !isSelected && !isInCheck && !isLight && "hover:bg-slate-500",
        isValidMove && "after:absolute after:w-5 after:h-5 after:bg-emerald-500 after:rounded-full after:opacity-80",
        isValidCapture && "after:absolute after:w-full after:h-full after:border-3 after:border-emerald-500 after:bg-transparent"
      )}
      onClick={onClick}
      data-testid={`square-${square}`}
    >
      {piece && (
        <span 
          className="chess-piece transition-transform duration-300 hover:scale-110"
          data-testid={`piece-${square}`}
        >
          {getPieceSymbol(piece)}
        </span>
      )}
    </div>
  );
}
