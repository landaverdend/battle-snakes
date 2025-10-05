import { PlayerList } from '@/components/PlayerList';
import Canvas from '@/components/Canvas';
import { MessageFeed } from '@/components/MessageFeed';
import RoundHeader from '@/components/RoundHeader';
import { GameConfigOptions } from '@/game/GameRunner';

interface MVProps {
  gameConfig: GameConfigOptions;
}
export function MainView({ gameConfig }: MVProps) {
  return (
    <div className="flex flex-col gap-[5vh] h-screen w-screen bg-windows-bg overflow-y-auto">
      <RoundHeader />
      <div className="flex flex-col xl:flex-row justify-center items-center gap-6">
        <Canvas gameConfig={gameConfig} className="xl:order-2" />
        <PlayerList className="xl:order-1" />
        <MessageFeed isLocalGame={gameConfig.isLocalGame} className="xl:order-3" />
      </div>
    </div>
  );
}
