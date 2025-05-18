import { MainView } from '@views/mainView/MainView';
import { useState } from 'react';
import SplashView from './splashView/SplashView';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

/* Pick a theme of your choice */
import original from 'react95/dist/themes/original';
import { styleReset } from 'react95';
import { GameConfigOptions } from '@/game/GameRunner';

const GlobalStyles = createGlobalStyle`${styleReset}`;

export enum View {
  SPLASH = 'splash',
  MAIN = 'main',
}
export default function App() {
  const [view, setView] = useState<View>(View.SPLASH);

  const [gameConfig, setGameConfig] = useState<GameConfigOptions>({
    playerName: '',
    playerColor: '',
    isLocalGame: false,
  });

  const handleComplete = (playerName: string, playerColor: string, isLocalGame: boolean) => {
    setView(View.MAIN);

    setGameConfig({ playerName, playerColor, isLocalGame: isLocalGame });
  };

  let viewToRender = null;

  switch (view) {
    case View.SPLASH:
      viewToRender = <SplashView onComplete={handleComplete} />;
      break;
    case View.MAIN:
      viewToRender = <MainView gameConfig={gameConfig} />;
      break;
  }

  return (
    <>
      <GlobalStyles />
      <ThemeProvider theme={original}>{viewToRender}</ThemeProvider>
    </>
  );
}
