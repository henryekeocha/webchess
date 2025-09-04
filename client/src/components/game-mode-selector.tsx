import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIDifficulty } from "@/lib/chess-ai";

export type GameMode = 'human-vs-human' | 'human-vs-ai';

interface GameModeInfo {
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
}

interface GameModeSelectorProps {
  onModeSelect: (modeInfo: GameModeInfo) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GameModeSelector({ onModeSelect, isOpen, onOpenChange }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('human-vs-human');
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');

  const handleStartGame = () => {
    const modeInfo: GameModeInfo = {
      mode: selectedMode,
      ...(selectedMode === 'human-vs-ai' && { aiDifficulty: selectedDifficulty })
    };
    onModeSelect(modeInfo);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="game-mode-selector">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Game Mode</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Human vs Human */}
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedMode === 'human-vs-human' 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedMode('human-vs-human')}
            data-testid="mode-human-vs-human"
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <CardTitle>Human vs Human</CardTitle>
              <CardDescription>Play against a friend on the same device</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <Badge variant="secondary">Local Multiplayer</Badge>
                <p className="text-sm text-muted-foreground">
                  Take turns playing white and black pieces
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Human vs AI */}
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedMode === 'human-vs-ai' 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedMode('human-vs-ai')}
            data-testid="mode-human-vs-ai"
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">🤖</div>
              <CardTitle>Human vs AI</CardTitle>
              <CardDescription>Challenge the computer opponent</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <Badge variant="default">AI Opponent</Badge>
                <p className="text-sm text-muted-foreground">
                  Test your skills against intelligent AI
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Difficulty Selection */}
        {selectedMode === 'human-vs-ai' && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-4 text-center">Select AI Difficulty</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={selectedDifficulty === 'easy' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('easy')}
                className="h-auto py-3 flex flex-col gap-1"
                data-testid="difficulty-easy"
              >
                <span className="text-green-600">🟢</span>
                <span className="font-medium">Easy</span>
                <span className="text-xs opacity-70">Beginner friendly</span>
              </Button>
              <Button
                variant={selectedDifficulty === 'medium' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('medium')}
                className="h-auto py-3 flex flex-col gap-1"
                data-testid="difficulty-medium"
              >
                <span className="text-yellow-600">🟡</span>
                <span className="font-medium">Medium</span>
                <span className="text-xs opacity-70">Balanced challenge</span>
              </Button>
              <Button
                variant={selectedDifficulty === 'hard' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('hard')}
                className="h-auto py-3 flex flex-col gap-1"
                data-testid="difficulty-hard"
              >
                <span className="text-red-600">🔴</span>
                <span className="font-medium">Hard</span>
                <span className="text-xs opacity-70">Expert level</span>
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-card rounded border">
              <div className="text-sm">
                <strong>Difficulty Details:</strong>
                {selectedDifficulty === 'easy' && (
                  <p className="mt-1 text-muted-foreground">
                    AI thinks 2 moves ahead. Makes occasional suboptimal moves. Great for learning!
                  </p>
                )}
                {selectedDifficulty === 'medium' && (
                  <p className="mt-1 text-muted-foreground">
                    AI thinks 3 moves ahead. Solid strategic play. Good for intermediate players.
                  </p>
                )}
                {selectedDifficulty === 'hard' && (
                  <p className="mt-1 text-muted-foreground">
                    AI thinks 4 moves ahead. Advanced tactics and positioning. Challenging for experts!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStartGame} className="px-8" data-testid="button-start-game">
            Start Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}