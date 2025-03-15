import { useSocket } from '../hooks/useSocket';

export default function App() {
  const { serverMessage, players } = useSocket();

  return (
    <div>
      <h1>Battle Snakes</h1>
      <p>Server says: {serverMessage || 'Waiting for server...'}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {players.map((player) => (
          <span key={player}>{player}</span>
        ))}
      </div>
    </div>
  );
}
