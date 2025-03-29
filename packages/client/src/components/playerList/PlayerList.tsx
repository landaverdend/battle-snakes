import { useEffect, useState } from 'react';
import { PlayerData } from '@battle-snakes/shared';
import { LeaderboardManager } from '@/game/LeaderBoardManager';
import './player-list.css';

type PLIProps = {
  player: PlayerData;
};
function PlayerListItem({ player }: PLIProps) {
  return (
    <span className="player-list-item">
      {player.id}
      <span className="color-box" style={{ backgroundColor: player.color }}></span>
    </span>
  );
}

export function PlayerList() {
  const [players, setPlayers] = useState<PlayerData[]>([]);

  useEffect(() => {
    const handleLeaderboardUpdate = (players: PlayerData[]) => {
      setPlayers(players);
    };

    // Subscribe to updates
    LeaderboardManager.getInstance().addListener(handleLeaderboardUpdate);

    // Initial state
    setPlayers(LeaderboardManager.getInstance().getPlayers());

    // Cleanup
    return () => {
      LeaderboardManager.getInstance().removeListener(handleLeaderboardUpdate);
    };
  }, []);

  return (
    <div className="player-list-container">
      <h3>Leaderboard</h3>
      <div className="player-list">
        {players.map((player) => (
          <PlayerListItem key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
