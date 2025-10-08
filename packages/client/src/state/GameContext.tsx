import { GameConfigOptions, GameRunner } from '@/game/GameRunner';
import { createContext, useContext } from 'react';

interface GameContextType {
  gameRunner: GameRunner | null;
  setGameRunner: (gameRunner: GameRunner | null) => void;
  gameConfig: GameConfigOptions;
  setGameConfig: (gameConfig: GameConfigOptions) => void;
}
const GameContext = createContext<GameContextType>({
  gameRunner: null,
  setGameRunner: () => {},
  gameConfig: {
    playerName: '',
    playerColor: '',
    isLocalGame: false,
  },
  setGameConfig: () => {},
});
export const GameProvider = GameContext.Provider;

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }

  return context;
};
