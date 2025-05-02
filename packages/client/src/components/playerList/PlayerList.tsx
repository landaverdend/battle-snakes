import { useEffect, useState } from 'react';
import { PlayerData } from '@battle-snakes/shared';
import { LeaderBoardService } from '@/game/LeaderBoardService';
import './player-list.css';
import { Window, WindowHeader } from 'react95';

type PLIProps = {
  player: PlayerData;
};
function PlayerListItem({ player }: PLIProps) {
  return (
    <span className="player-list-item">
      {player.score} - {player.name}
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
    LeaderBoardService.getInstance().addListener(handleLeaderboardUpdate);

    // Initial state
    setPlayers(LeaderBoardService.getInstance().getPlayers());

    // Cleanup
    return () => {
      LeaderBoardService.getInstance().removeListener(handleLeaderboardUpdate);
    };
  }, []);

  return (
    <Window>
      <WindowHeader>Leaderboard</WindowHeader>
      <div className="player-list-container">
        <div className="player-list">
          {players.map((player) => (
            <PlayerListItem key={player.name} player={player} />
          ))}
        </div>
      </div>
    </Window>
  );
}
