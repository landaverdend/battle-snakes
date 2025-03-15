import { useSocket } from '../hooks/useSocket';

export default function App() {
  const { serverMessage } = useSocket();

  return (
    <div>
      <h1>Battle Snakes</h1>
      <p>Server says: {serverMessage || 'Waiting for server...'}</p>
    </div>
  );
}
