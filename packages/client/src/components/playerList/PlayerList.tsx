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
import { useLeaderboard } from '@/hooks/useLeaderboard';

export function PlayerList() {
  const { players } = useLeaderboard();

  return (
    <Window className="player-list-window">
      <WindowHeader>Leaderboard</WindowHeader>
      <WindowContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Color</TableHeadCell>
              <TableHeadCell>Score</TableHeadCell>
              <TableHeadCell>Length</TableHeadCell>
              <TableHeadCell>Games Won</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.name} className="player-list-row">
                <TableDataCell>
                  {player.name} <span style={{ color: 'red' }}>{player.isAlive ? '' : ' (DEAD)'}</span>
                </TableDataCell>
                <TableDataCell className="avatar-cell">
                  <Avatar square size={20} style={{ background: player.color, color: player.color }}>
                    0
                  </Avatar>
                </TableDataCell>
                <TableDataCell>{player.score}</TableDataCell>
                <TableDataCell>{player.length}</TableDataCell>
                <TableDataCell>{player.gamesWon}</TableDataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </WindowContent>
    </Window>
  );
}
