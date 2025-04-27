import { useState } from 'react';
import './splash-view.css';
import { getRandomColor } from '@battle-snakes/shared';

type SVProps = {
  onComplete: (playerName: string, playerColor: string, isCpuGame: boolean) => void;
};

export default function SplashView({ onComplete }: SVProps) {
  const [playerName, setPlayerName] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<string>(getRandomColor());

  return (
    <div className="splash-view-container">
      <h1>Battle Snakes!</h1>
      <input type="text" placeholder="Enter your name" onChange={(e) => setPlayerName(e.target.value)} />
      <span>
        Color: {'  '}
        <input
          type="color"
          value={playerColor}
          onChange={(e) => {
            setPlayerColor(e.target.value);
          }}
        />
      </span>

      <button onClick={() => onComplete(playerName, playerColor, false)}>Play Online</button>
      <button onClick={() => onComplete(playerName, playerColor, true)}>Play Against CPU</button>
    </div>
  );
}
