import { PlayerList } from '@/components/PlayerList';
import Canvas from '@/components/Canvas';
import { MessageFeed } from '@/components/MessageFeed';
import RoundHeader from '@/components/RoundHeader';
import { ComponentSlide } from '@/components/ComponentSlide';
import { useEffect, useState } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';
import { PhoneControls } from '@/components/PhoneControls';
import { useGameContext } from '@/state/GameContext';

interface MVProps {}
export function MainView({}: MVProps) {
  const { gameConfig } = useGameContext();
  const windowSize = useWindowSize();

  const [displayTouchControls, setDisplayTouchControls] = useState(false);

  useEffect(() => {
    if (windowSize.width < 800) {
      setDisplayTouchControls(true);
    } else {
      setDisplayTouchControls(false);
    }
  }, [windowSize]);

  return (
    <div className="flex flex-col gap-[5vh] h-screen w-screen bg-windows-bg overflow-y-auto">
      <RoundHeader />
      <div className="flex flex-col xl:flex-row justify-center items-center gap-6">
        <Canvas className="xl:order-2" />
        {displayTouchControls && <PhoneControls />}

        <ComponentSlide position="left">
          <PlayerList className="xl:order-1" />
        </ComponentSlide>
        <ComponentSlide position="right">
          <MessageFeed isLocalGame={gameConfig.isLocalGame} className="xl:order-3" />
        </ComponentSlide>
      </div>
    </div>
  );
}
