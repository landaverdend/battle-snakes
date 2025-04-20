import './main-view.css';

import { PlayerList } from '@components/playerList/PlayerList';
import Canvas from '@components/canvas/Canvas';

import { MessageFeed } from '@components/messageFeed/MessageFeed';
import RoundHeader from '@/components/roundHeader/RoundHeader';

interface MVProps {
  playerName: string;
  playerColor: string;
}
export function MainView({ playerName, playerColor }: MVProps) {
  return (
    <div className="main-view-container">
      <RoundHeader />
      <div className="dock-container">
        <PlayerList />
        <Canvas playerName={playerName} playerColor={playerColor} />
        <MessageFeed />
      </div>
    </div>
  );
}
