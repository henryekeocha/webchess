import { ChessPiece, PieceType, PieceColor, Position, ChessMove, GameStatus } from "@shared/schema";

export class ChessEngine {
  private board: (ChessPiece | null)[][] = [];
  private currentPlayer: PieceColor = 'white';
  private moveHistory: ChessMove[] = [];
  private gameStatus: GameStatus = 'playing';
  private enPassantTarget: string | null = null;
  private castlingRights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  };

  constructor() {
    this.initializeBoard();
  }

  private initializeBoard(): void {
    // Initialize empty board
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Place pieces in starting position
    const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    // Black pieces
    for (let col = 0; col < 8; col++) {
      this.board[0][col] = { type: backRank[col], color: 'black' };
      this.board[1][col] = { type: 'pawn', color: 'black' };
    }

    // White pieces
    for (let col = 0; col < 8; col++) {
      this.board[7][col] = { type: backRank[col], color: 'white' };
      this.board[6][col] = { type: 'pawn', color: 'white' };
    }
  }

  public getBoard(): (ChessPiece | null)[][] {
    return this.board;
  }

  public getCurrentPlayer(): PieceColor {
    return this.currentPlayer;
  }

  public getMoveHistory(): ChessMove[] {
    return this.moveHistory;
  }

  public getGameStatus(): GameStatus {
    return this.gameStatus;
  }

  public getCapturedPieces(): { white: ChessPiece[], black: ChessPiece[] } {
    const captured = { white: [] as ChessPiece[], black: [] as ChessPiece[] };
    
    this.moveHistory.forEach(move => {
      if (move.capturedPiece) {
        captured[move.capturedPiece.color].push(move.capturedPiece);
      }
    });

    return captured;
  }

  public positionToSquare(position: Position): string {
    return String.fromCharCode(97 + position.col) + (8 - position.row);
  }

  public squareToPosition(square: string): Position {
    return {
      col: square.charCodeAt(0) - 97,
      row: 8 - parseInt(square[1])
    };
  }

  public isValidMove(from: string, to: string): boolean {
    const fromPos = this.squareToPosition(from);
    const toPos = this.squareToPosition(to);
    const piece = this.board[fromPos.row][fromPos.col];

    if (!piece || piece.color !== this.currentPlayer) {
      return false;
    }

    // Check if destination square has friendly piece
    const targetPiece = this.board[toPos.row][toPos.col];
    if (targetPiece && targetPiece.color === piece.color) {
      return false;
    }

    // Check piece-specific movement rules
    if (!this.isValidPieceMove(piece, fromPos, toPos)) {
      return false;
    }

    // Check if move would leave king in check
    return !this.wouldMoveCauseCheck(fromPos, toPos);
  }

  private isValidPieceMove(piece: ChessPiece, from: Position, to: Position): boolean {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    switch (piece.type) {
      case 'pawn':
        return this.isValidPawnMove(piece, from, to, rowDiff, colDiff);
      case 'rook':
        return (rowDiff === 0 || colDiff === 0) && this.isPathClear(from, to);
      case 'bishop':
        return absRowDiff === absColDiff && this.isPathClear(from, to);
      case 'queen':
        return (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) && this.isPathClear(from, to);
      case 'king':
        return absRowDiff <= 1 && absColDiff <= 1;
      case 'knight':
        return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
      default:
        return false;
    }
  }

  private isValidPawnMove(piece: ChessPiece, from: Position, to: Position, rowDiff: number, colDiff: number): boolean {
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    const targetPiece = this.board[to.row][to.col];

    // Forward move
    if (colDiff === 0) {
      if (targetPiece) return false; // Can't capture forward
      if (rowDiff === direction) return true; // One square forward
      if (from.row === startRow && rowDiff === 2 * direction) return true; // Two squares from start
      return false;
    }

    // Diagonal capture
    if (Math.abs(colDiff) === 1 && rowDiff === direction) {
      if (targetPiece && targetPiece.color !== piece.color) return true;
      // En passant
      const enPassantSquare = this.positionToSquare(to);
      if (this.enPassantTarget === enPassantSquare) return true;
    }

    return false;
  }

  private isPathClear(from: Position, to: Position): boolean {
    const rowStep = Math.sign(to.row - from.row);
    const colStep = Math.sign(to.col - from.col);
    
    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row || currentCol !== to.col) {
      if (this.board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  private wouldMoveCauseCheck(from: Position, to: Position): boolean {
    // Create a temporary board state
    const originalPiece = this.board[to.row][to.col];
    const movingPiece = this.board[from.row][from.col];
    
    // Make the move temporarily
    this.board[to.row][to.col] = movingPiece;
    this.board[from.row][from.col] = null;

    // Check if king is in check
    const kingInCheck = this.isKingInCheck(this.currentPlayer);

    // Restore board state
    this.board[from.row][from.col] = movingPiece;
    this.board[to.row][to.col] = originalPiece;

    return kingInCheck;
  }

  private isKingInCheck(color: PieceColor): boolean {
    const kingPosition = this.findKing(color);
    if (!kingPosition) return false;

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color !== color) {
          if (this.canPieceAttackSquare(piece, { row, col }, kingPosition)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private findKing(color: PieceColor): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  private canPieceAttackSquare(piece: ChessPiece, piecePos: Position, targetPos: Position): boolean {
    // Similar to isValidPieceMove but doesn't check for check
    const rowDiff = targetPos.row - piecePos.row;
    const colDiff = targetPos.col - piecePos.col;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        return Math.abs(colDiff) === 1 && rowDiff === direction;
      case 'rook':
        return (rowDiff === 0 || colDiff === 0) && this.isPathClear(piecePos, targetPos);
      case 'bishop':
        return absRowDiff === absColDiff && this.isPathClear(piecePos, targetPos);
      case 'queen':
        return (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) && this.isPathClear(piecePos, targetPos);
      case 'king':
        return absRowDiff <= 1 && absColDiff <= 1;
      case 'knight':
        return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
      default:
        return false;
    }
  }

  public getValidMoves(square: string): string[] {
    const position = this.squareToPosition(square);
    const piece = this.board[position.row][position.col];
    
    if (!piece || piece.color !== this.currentPlayer) {
      return [];
    }

    const validMoves: string[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const targetSquare = this.positionToSquare({ row, col });
        if (this.isValidMove(square, targetSquare)) {
          validMoves.push(targetSquare);
        }
      }
    }

    return validMoves;
  }

  public makeMove(from: string, to: string): boolean {
    if (!this.isValidMove(from, to)) {
      return false;
    }

    const fromPos = this.squareToPosition(from);
    const toPos = this.squareToPosition(to);
    const movingPiece = this.board[fromPos.row][fromPos.col]!;
    const capturedPiece = this.board[toPos.row][toPos.col];

    // Make the move
    this.board[toPos.row][toPos.col] = movingPiece;
    this.board[fromPos.row][fromPos.col] = null;

    // Handle en passant capture
    if (movingPiece.type === 'pawn' && this.enPassantTarget === to && !capturedPiece) {
      const captureRow = toPos.row + (movingPiece.color === 'white' ? 1 : -1);
      this.board[captureRow][toPos.col] = null;
    }

    // Set en passant target for next turn
    this.enPassantTarget = null;
    if (movingPiece.type === 'pawn' && Math.abs(toPos.row - fromPos.row) === 2) {
      const enPassantRow = fromPos.row + (movingPiece.color === 'white' ? -1 : 1);
      this.enPassantTarget = this.positionToSquare({ row: enPassantRow, col: fromPos.col });
    }

    // Update castling rights
    this.updateCastlingRights(movingPiece, fromPos);

    // Generate move notation and add to history
    const notation = this.generateMoveNotation(movingPiece, from, to, capturedPiece);
    const move: ChessMove = {
      from,
      to,
      piece: movingPiece,
      capturedPiece: capturedPiece || undefined,
      notation,
      moveNumber: Math.ceil((this.moveHistory.length + 1) / 2)
    };
    this.moveHistory.push(move);

    // Switch players
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    // Update game status
    this.updateGameStatus();

    return true;
  }

  private updateCastlingRights(piece: ChessPiece, from: Position): void {
    if (piece.type === 'king') {
      if (piece.color === 'white') {
        this.castlingRights.whiteKingSide = false;
        this.castlingRights.whiteQueenSide = false;
      } else {
        this.castlingRights.blackKingSide = false;
        this.castlingRights.blackQueenSide = false;
      }
    } else if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (from.col === 0) this.castlingRights.whiteQueenSide = false;
        if (from.col === 7) this.castlingRights.whiteKingSide = false;
      } else {
        if (from.col === 0) this.castlingRights.blackQueenSide = false;
        if (from.col === 7) this.castlingRights.blackKingSide = false;
      }
    }
  }

  private generateMoveNotation(piece: ChessPiece, from: string, to: string, captured?: ChessPiece | null): string {
    let notation = '';

    if (piece.type === 'pawn') {
      if (captured) {
        notation = from[0] + 'x' + to;
      } else {
        notation = to;
      }
    } else {
      const pieceSymbol = piece.type === 'knight' ? 'N' : piece.type.toUpperCase()[0];
      notation = pieceSymbol;
      
      if (captured) {
        notation += 'x';
      }
      notation += to;
    }

    return notation;
  }

  private updateGameStatus(): void {
    const opponentColor = this.currentPlayer;
    const hasValidMoves = this.hasValidMoves(opponentColor);
    const isInCheck = this.isKingInCheck(opponentColor);

    if (!hasValidMoves) {
      if (isInCheck) {
        this.gameStatus = 'checkmate';
      } else {
        this.gameStatus = 'stalemate';
      }
    } else if (isInCheck) {
      this.gameStatus = 'check';
    } else {
      this.gameStatus = 'playing';
    }
  }

  private hasValidMoves(color: PieceColor): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === color) {
          const from = this.positionToSquare({ row, col });
          const validMoves = this.getValidMoves(from);
          if (validMoves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public resetGame(): void {
    this.board = [];
    this.currentPlayer = 'white';
    this.moveHistory = [];
    this.gameStatus = 'playing';
    this.enPassantTarget = null;
    this.castlingRights = {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    };
    this.initializeBoard();
  }

  public isSquareUnderAttack(square: string, byColor: PieceColor): boolean {
    const targetPos = this.squareToPosition(square);
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === byColor) {
          if (this.canPieceAttackSquare(piece, { row, col }, targetPos)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
}
