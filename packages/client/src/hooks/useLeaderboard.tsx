import { LeaderboardObservable } from '@/state/LeaderboardObservable';
import { PlayerData } from '@battle-snakes/shared';
import { useEffect, useState } from 'react';

export function useLeaderboard() {
  const [players, setPlayers] = useState<Array<PlayerData>>([]);

  useEffect(() => {
    const handleLeaderboardUpdate = (players: PlayerData[]) => {
      setPlayers(players);
    };

    // Subscribe to updates
    LeaderboardObservable.getInstance().subscribe(handleLeaderboardUpdate);


    // Initial state
    setPlayers(LeaderboardObservable.getInstance().getState());

    // Cleanup
    return () => {
      LeaderboardObservable.getInstance().unsubscribe(handleLeaderboardUpdate);
    };
  }, []);

  return { players };
}
