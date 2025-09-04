import { ChessEngine } from "./chess-engine";
import { ChessPiece, PieceType, PieceColor, Position } from "@shared/schema";

export type AIDifficulty = 'easy' | 'medium' | 'hard';

interface EvaluatedMove {
  from: string;
  to: string;
  score: number;
}

export class ChessAI {
  private engine: ChessEngine;
  private difficulty: AIDifficulty;
  private maxDepth: number;

  // Piece values for evaluation
  private readonly pieceValues: Record<PieceType, number> = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
  };

  // Position tables for piece evaluation
  private readonly pawnTable = [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [ 50, 50, 50, 50, 50, 50, 50, 50],
    [ 10, 10, 20, 30, 30, 20, 10, 10],
    [  5,  5, 10, 25, 25, 10,  5,  5],
    [  0,  0,  0, 20, 20,  0,  0,  0],
    [  5, -5,-10,  0,  0,-10, -5,  5],
    [  5, 10, 10,-20,-20, 10, 10,  5],
    [  0,  0,  0,  0,  0,  0,  0,  0]
  ];

  private readonly knightTable = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  private readonly bishopTable = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];

  private readonly rookTable = [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [  5, 10, 10, 10, 10, 10, 10,  5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [  0,  0,  0,  5,  5,  0,  0,  0]
  ];

  private readonly queenTable = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ];

  private readonly kingTable = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ];

  constructor(engine: ChessEngine, difficulty: AIDifficulty = 'medium') {
    this.engine = engine;
    this.difficulty = difficulty;
    this.maxDepth = this.getDepthForDifficulty(difficulty);
  }

  private getDepthForDifficulty(difficulty: AIDifficulty): number {
    switch (difficulty) {
      case 'easy': return 2;
      case 'medium': return 3;
      case 'hard': return 4;
      default: return 3;
    }
  }

  public setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
    this.maxDepth = this.getDepthForDifficulty(difficulty);
  }

  public getBestMove(): { from: string; to: string } | null {
    const currentPlayer = this.engine.getCurrentPlayer();
    const bestMove = this.minimax(this.maxDepth, true, -Infinity, Infinity, currentPlayer);
    
    if (bestMove.from && bestMove.to) {
      return { from: bestMove.from, to: bestMove.to };
    }
    
    return null;
  }

  private minimax(
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number,
    color: PieceColor
  ): EvaluatedMove {
    if (depth === 0) {
      return {
        from: '',
        to: '',
        score: this.evaluatePosition(color)
      };
    }

    const moves = this.getAllValidMoves(color);
    
    if (moves.length === 0) {
      // Game over - return extreme values
      const gameStatus = this.engine.getGameStatus();
      if (gameStatus === 'checkmate') {
        return {
          from: '',
          to: '',
          score: isMaximizing ? -999999 : 999999
        };
      } else {
        return { from: '', to: '', score: 0 }; // Stalemate
      }
    }

    let bestMove: EvaluatedMove = {
      from: '',
      to: '',
      score: isMaximizing ? -Infinity : Infinity
    };

    // Add some randomness for easy difficulty
    if (this.difficulty === 'easy') {
      moves.sort(() => Math.random() - 0.5);
    }

    for (const move of moves) {
      // Make the move temporarily
      const originalBoard = this.cloneBoard();
      const originalMoveHistory = [...this.engine.getMoveHistory()];
      const originalCurrentPlayer = this.engine.getCurrentPlayer();
      const originalGameStatus = this.engine.getGameStatus();

      const moveSuccess = this.engine.makeMove(move.from, move.to);
      if (!moveSuccess) continue;

      const nextColor = color === 'white' ? 'black' : 'white';
      const evaluation = this.minimax(depth - 1, !isMaximizing, alpha, beta, nextColor);

      // Restore board state
      this.restoreBoard(originalBoard, originalMoveHistory, originalCurrentPlayer, originalGameStatus);

      if (isMaximizing) {
        if (evaluation.score > bestMove.score) {
          bestMove = {
            from: move.from,
            to: move.to,
            score: evaluation.score
          };
        }
        alpha = Math.max(alpha, evaluation.score);
      } else {
        if (evaluation.score < bestMove.score) {
          bestMove = {
            from: move.from,
            to: move.to,
            score: evaluation.score
          };
        }
        beta = Math.min(beta, evaluation.score);
      }

      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }

    return bestMove;
  }

  private getAllValidMoves(color: PieceColor): { from: string; to: string }[] {
    const moves: { from: string; to: string }[] = [];
    const board = this.engine.getBoard();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const from = this.engine.positionToSquare({ row, col });
          const validMoves = this.engine.getValidMoves(from);
          
          for (const to of validMoves) {
            moves.push({ from, to });
          }
        }
      }
    }

    return moves;
  }

  private evaluatePosition(aiColor: PieceColor): number {
    let score = 0;
    const board = this.engine.getBoard();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          let pieceValue = this.pieceValues[piece.type];
          pieceValue += this.getPositionValue(piece, row, col);

          if (piece.color === aiColor) {
            score += pieceValue;
          } else {
            score -= pieceValue;
          }
        }
      }
    }

    // Add bonus for game state
    const gameStatus = this.engine.getGameStatus();
    const currentPlayer = this.engine.getCurrentPlayer();
    
    if (gameStatus === 'checkmate') {
      if (currentPlayer !== aiColor) {
        score += 999999; // AI wins
      } else {
        score -= 999999; // AI loses
      }
    } else if (gameStatus === 'check') {
      if (currentPlayer !== aiColor) {
        score += 50; // AI giving check
      } else {
        score -= 50; // AI in check
      }
    }

    return score;
  }

  private getPositionValue(piece: ChessPiece, row: number, col: number): number {
    let table: number[][];
    
    switch (piece.type) {
      case 'pawn':
        table = this.pawnTable;
        break;
      case 'knight':
        table = this.knightTable;
        break;
      case 'bishop':
        table = this.bishopTable;
        break;
      case 'rook':
        table = this.rookTable;
        break;
      case 'queen':
        table = this.queenTable;
        break;
      case 'king':
        table = this.kingTable;
        break;
      default:
        return 0;
    }

    // Flip table for black pieces
    if (piece.color === 'black') {
      return table[7 - row][col];
    } else {
      return table[row][col];
    }
  }

  private cloneBoard(): (ChessPiece | null)[][] {
    const board = this.engine.getBoard();
    return board.map(row => [...row]);
  }

  private restoreBoard(
    board: (ChessPiece | null)[][],
    moveHistory: any[],
    currentPlayer: PieceColor,
    gameStatus: any
  ): void {
    // This is a simplified restore - in a real implementation,
    // you'd need to properly restore all engine state
    this.engine.resetGame();
    
    // Replay moves to restore state
    for (const move of moveHistory) {
      this.engine.makeMove(move.from, move.to);
    }
  }
}