import { useSocket } from '../hooks/useSocket';
import Canvas from './canvas/Canvas';

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
      <div style={{ width: '50vw', height: '50vw' }}>
        <Canvas width={30} height={30} />
      </div>
    </div>
  );
}
