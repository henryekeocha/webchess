import { ChessPiece } from "@shared/schema";

// Unicode chess pieces
export const PIECE_SYMBOLS = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
} as const;

export function getPieceSymbol(piece: ChessPiece | null): string {
  if (!piece) return '';
  return PIECE_SYMBOLS[piece.color][piece.type];
}

export function isLightSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 0;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getSquareNotation(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (8 - row);
}

export function parseSquareNotation(square: string): { row: number; col: number } {
  return {
    col: square.charCodeAt(0) - 97,
    row: 8 - parseInt(square[1])
  };
}
