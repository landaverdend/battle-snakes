import { useEffect, useState } from 'react';
import { GameAction } from '@battle-snakes/shared';
import { ActionFeedManager } from '@game/ActionFeedManager';

export function ActionFeed() {
  const [actions, setActions] = useState<GameAction[]>([]);

  useEffect(() => {
    const handleActionUpdate = (newActions: GameAction[]) => {
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
        <span className="action-item">Player: '{action.playerId}' hit the wall...</span>
      ))}
    </div>
  );
}
