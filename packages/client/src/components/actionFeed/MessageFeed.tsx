import { useEffect, useState } from 'react';
import { ActionFeedManager } from '@game/ActionFeedManager';
import './message-feed.css';
import { Collision } from '@battle-snakes/shared';

function grabTextToDisplay(collision: Collision) {
  let toRet = '';

  switch (collision.type) {
    case 'wall':
      toRet = `${collision.playerId} hit the wall...`;
      break;
    case 'food':
      break;
    case 'self':
      toRet = `${collision.playerId} hit himself like a retard...`;
      break;
    case 'snake':
      toRet = `${collision.playerId} hit ${collision.otherPlayerId}...`;
      break;
  }

  return toRet;
}

export function MessageFeed() {
  const [actions, setActions] = useState<Collision[]>([]);

  useEffect(() => {
    const handleActionUpdate = (newActions: Collision[]) => {
      setActions(newActions);
    };

    // Subscribe to updates
    ActionFeedManager.getInstance().addListener(handleActionUpdate);

    // Initial state
    setActions(ActionFeedManager.getInstance().getActions());

    // Cleanup
    return () => {
      ActionFeedManager.getInstance().removeListener(handleActionUpdate);
    };
  }, []);

  return (
    <div className="action-feed-container">
      <h3>Action Feed</h3>
      {actions.map((collision) => (
        <span key={crypto.randomUUID()} className="action-item">
          {grabTextToDisplay(collision)}
        </span>
      ))}
    </div>
  );
}
