import { MainView } from '@views/mainView/MainView';
import { useState } from 'react';
import SplashView from './splashView/SplashView';

export enum View {
  SPLASH = 'splash',
  MAIN = 'main',
}
export default function App() {
  const [view, setView] = useState<View>(View.SPLASH);
  const [playerName, setPlayerName] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<string>('');

  const handleComplete = (playerName: string, playerColor: string) => {
    setView(View.MAIN);
    setPlayerName(playerName);
    setPlayerColor(playerColor);
  };

  let viewToRender = null;

  switch (view) {
    case View.SPLASH:
      viewToRender = <SplashView onComplete={handleComplete} />;
      break;
    case View.MAIN:
      viewToRender = <MainView playerColor={playerColor} playerName={playerName} />;
      break;
  }

  return <>{viewToRender}</>;
}
