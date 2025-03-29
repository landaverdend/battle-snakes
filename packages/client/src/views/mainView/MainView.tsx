import { PlayerList } from '@components/playerList/PlayerList';
import Canvas from '@components/canvas/Canvas';

import './main-view.css';
import { MessageFeed } from '@/components/actionFeed/MessageFeed';

export function MainView() {
  return (
    <>
      <div className="main-view-container">
        <PlayerList />
        <Canvas />
        <MessageFeed />
      </div>
    </>
  );
}
