import { useEffect, useState } from 'react';
import { GameEvent } from '@battle-snakes/shared';
import { ActionFeedManager } from '@game/ActionFeedManager';
import './message-feed.css';

export function MessageFeed() {
  const [actions, setActions] = useState<GameEvent[]>([]);

  useEffect(() => {
    const handleActionUpdate = (newActions: GameEvent[]) => {
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
      {actions.map((action) => (
        <span key={crypto.randomUUID()} className="action-item">
          {action.targetId
            ? `Player ${action.playerId} hit player ${action.targetId}...`
            : `Player ${action.playerId} hit the wall...`}
        </span>
      ))}
    </div>
  );
}
