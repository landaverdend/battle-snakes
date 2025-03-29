import { PlayerList } from '@components/playerList/PlayerList';
import Canvas from '@components/canvas/Canvas';
import { ActionFeed } from '@components/actionFeed/ActionFeed';

import './main-view.css';

export function MainView() {
  return (
    <>
      <div className="main-view-container">
        <PlayerList />
        <Canvas />
        <ActionFeed />
      </div>
    </>
  );
}
