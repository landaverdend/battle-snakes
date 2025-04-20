import { useState } from 'react';
import './splash-view.css';

type SVProps = {
  onComplete: (playerName: string, playerColor: string) => void;
};

export default function SplashView({ onComplete }: SVProps) {
  const [playerName, setPlayerName] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<string>('#000000');

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

      <button onClick={() => onComplete(playerName, playerColor)}>Play Online</button>
    </div>
  );
}
