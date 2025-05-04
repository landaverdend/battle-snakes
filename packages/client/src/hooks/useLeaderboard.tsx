import { LeaderBoardService } from '@/game/LeaderBoardService';
import { PlayerData } from '@battle-snakes/shared';
import { useEffect, useState } from 'react';

export function useLeaderboard() {
  const [players, setPlayers] = useState<PlayerData[]>([]);

  useEffect(() => {
    const handleLeaderboardUpdate = (players: PlayerData[]) => {
      setPlayers(players);
    };

    // Subscribe to updates
    LeaderBoardService.getInstance().addListener(handleLeaderboardUpdate);

    // Initial state
    setPlayers(LeaderBoardService.getInstance().getPlayers());

    // Cleanup
    return () => {
      LeaderBoardService.getInstance().removeListener(handleLeaderboardUpdate);
    };
  }, []);

  return { players };
}
