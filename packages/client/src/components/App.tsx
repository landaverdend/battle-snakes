import Canvas from './canvas/Canvas';

export default function App() {
  return (
    <div>
      <h1>Battle Snakes</h1>

      
      <div style={{ width: '50vw', height: '50vw' }}>
        <Canvas width={30} height={30} />
      </div>

    </div>
  );
}
