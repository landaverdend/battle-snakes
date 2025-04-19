import './main-view.css';

import { PlayerList } from '@components/playerList/PlayerList';
import Canvas from '@components/canvas/Canvas';

import { MessageFeed } from '@components/messageFeed/MessageFeed';
import RoundHeader from '@/components/roundHeader/roundHeader';

export function MainView() {
  return (
    <div className="main-view-container">
      <RoundHeader />
      <div className="dock-container">
        <PlayerList />
        <Canvas />
        <MessageFeed />
      </div>
    </div>
  );
}
