import { MainView } from '@views/MainView';
import { useState } from 'react';
import SplashView from './SplashView';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

/* Pick a theme of your choice */
import original from 'react95/dist/themes/original';
import { styleReset } from 'react95';
import { GameConfigOptions, GameRunner } from '@/game/GameRunner';
import { GameProvider } from '@/state/GameContext';

const GlobalStyles = createGlobalStyle`${styleReset}`;

export enum View {
  SPLASH = 'splash',
  MAIN = 'main',
}
export default function App() {
  const [view, setView] = useState<View>(View.SPLASH);

  const [gameRunner, setGameRunner] = useState<GameRunner | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfigOptions>({
    playerName: '',
    playerColor: '',
    isLocalGame: false,
  });

  const onSelect = (playerName: string, playerColor: string, isLocalGame: boolean) => {
    setView(View.MAIN);
    setGameConfig({ playerName, playerColor, isLocalGame: isLocalGame });
  };

  let viewToRender = null;

  switch (view) {
    case View.SPLASH:
      viewToRender = <SplashView onComplete={onSelect} />;
      break;
    case View.MAIN:
      viewToRender = <MainView />;
      break;
  }

  return (
    <GameProvider
      value={{
        gameRunner: gameRunner,
        setGameRunner: (gr: GameRunner | null) => setGameRunner(gr ?? null),
        gameConfig: gameConfig,
        setGameConfig: (gc: GameConfigOptions) => setGameConfig(gc),
      }}>
      <GlobalStyles />
      <ThemeProvider theme={original}>{viewToRender}</ThemeProvider>
    </GameProvider>
  );
}
