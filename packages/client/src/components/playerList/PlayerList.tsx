import { useEffect, useState } from 'react';
import { PlayerData } from '@battle-snakes/shared';
import { LeaderBoardService } from '@/game/LeaderBoardService';
import './player-list.css';
import {
  Avatar,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Window,
  WindowContent,
  WindowHeader,
} from 'react95';

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
      <WindowContent>
        <Table style={{ width: '300px' }}>
          <TableHead>
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Color</TableHeadCell>
              <TableHeadCell>Score</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <TableRow className="player-list-row">
                <TableDataCell>{player.name}</TableDataCell>
                <TableDataCell className="avatar-cell">
                  <Avatar square size={20} style={{ background: player.color, color: player.color }}>
                    0
                  </Avatar>
                </TableDataCell>
                <TableDataCell>{player.score}</TableDataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </WindowContent>
    </Window>
  );
}
