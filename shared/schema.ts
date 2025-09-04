import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boardState: json("board_state").notNull(),
  moveHistory: json("move_history").notNull().default("[]"),
  currentPlayer: text("current_player").notNull().default("white"),
  gameStatus: text("game_status").notNull().default("playing"),
  whitePlayer: varchar("white_player"),
  blackPlayer: varchar("black_player"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Chess-specific types
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface ChessMove {
  from: string;
  to: string;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  notation: string;
  moveNumber: number;
}

export interface Position {
  row: number;
  col: number;
}
