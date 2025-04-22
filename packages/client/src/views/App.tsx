import { MainView } from '@views/mainView/MainView';
import { useState } from 'react';
import SplashView from './splashView/SplashView';
import { GameConfigOptions } from '@/game/GameClient';

export enum View {
  SPLASH = 'splash',
  MAIN = 'main',
}
export default function App() {
  const [view, setView] = useState<View>(View.SPLASH);

  const [gameConfig, setGameConfig] = useState<GameConfigOptions>({
    playerName: '',
    playerColor: '',
    isCpuGame: false,
  });

  const handleComplete = (playerName: string, playerColor: string, isCpuGame: boolean) => {
    setView(View.MAIN);

    setGameConfig({ playerName, playerColor, isCpuGame });
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

  return <>{viewToRender}</>;
}
