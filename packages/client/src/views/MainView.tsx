import { PlayerList } from '@components/playerList/PlayerList';
import Canvas from '@components/canvas/Canvas';
import { MessageFeed } from '@components/messageFeed/MessageFeed';
import RoundHeader from '@/components/roundHeader/RoundHeader';
import { GameConfigOptions } from '@/game/GameRunner';

interface MVProps {
  gameConfig: GameConfigOptions;
}
export function MainView({ gameConfig }: MVProps) {
  return (
    <div className="flex flex-col gap-[5vh] h-screen w-screen bg-windows-bg">
      <RoundHeader />
      <div className="flex flex-row justify-center gap-6">
        <PlayerList />
        <Canvas gameConfig={gameConfig} />
        <MessageFeed isLocalGame={gameConfig.isLocalGame} />
      </div>
    </div>
  );
}
