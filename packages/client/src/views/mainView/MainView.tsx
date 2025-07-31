import './main-view.css';

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
    <div className="main-view-container">
      <RoundHeader />
      <div className="dock-container">
        <PlayerList />
        <Canvas gameConfig={gameConfig} />
        <MessageFeed isLocalGame={gameConfig.isLocalGame} />
      </div>
    </div>
  );
}
