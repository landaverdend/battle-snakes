import { LeaderBoardState } from '@/game/LeaderboardState';
import { PlayerData } from '@battle-snakes/shared';
import { useEffect, useState } from 'react';

export function useLeaderboard() {
  const [players, setPlayers] = useState<Array<PlayerData>>([]);

  useEffect(() => {
    const handleLeaderboardUpdate = (players: PlayerData[]) => {
      setPlayers(players);
    };

    // Subscribe to updates
    LeaderBoardState.getInstance().addListener(handleLeaderboardUpdate);

    // Initial state
    setPlayers(LeaderBoardState.getInstance().getState());

    // Cleanup
    return () => {
      LeaderBoardState.getInstance().removeListener(handleLeaderboardUpdate);
    };
  }, []);

  return { players };
}
