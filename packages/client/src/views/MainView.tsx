import { PlayerList } from '@/components/PlayerList';
import Canvas from '@/components/Canvas';
import { MessageFeed } from '@/components/MessageFeed';
import RoundHeader from '@/components/RoundHeader';
import { ComponentSlide, MobileDrawer } from '@/components/ComponentSlide';
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
    // Show touch controls on small screens or touch-capable devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = windowSize.width < 800;
    setDisplayTouchControls(isSmallScreen || isTouchDevice);
  }, [windowSize]);

  const playerList = <PlayerList className="xl:order-1" />;
  const messageFeed = <MessageFeed isLocalGame={gameConfig.isLocalGame} className="xl:order-3" />;

  return (
    <div className="flex flex-col gap-4 sm:gap-[5vh] min-h-screen w-screen bg-windows-bg overflow-y-auto pb-20 sm:pb-4">
      <RoundHeader />
      <div className="flex flex-col xl:flex-row justify-center items-center gap-4 sm:gap-6 px-2 sm:px-4">
        <Canvas className="xl:order-2" />
        {displayTouchControls && (
          <div className="flex justify-center w-full sm:w-auto">
            <PhoneControls />
          </div>
        )}

        <ComponentSlide position="left">{playerList}</ComponentSlide>
        <ComponentSlide position="right">{messageFeed}</ComponentSlide>
      </div>

      {/* Mobile bottom drawer with tabs */}
      <MobileDrawer leftPanel={playerList} rightPanel={messageFeed} />
    </div>
  );
}
