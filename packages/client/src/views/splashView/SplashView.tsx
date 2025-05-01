import { useState } from 'react';
import './splash-view.css';
import { getRandomColor } from '@battle-snakes/shared';
import { Button, ColorInput, GroupBox, TextInput } from 'react95';

type SVProps = {
  onComplete: (playerName: string, playerColor: string, isCpuGame: boolean) => void;
};

export default function SplashView({ onComplete }: SVProps) {
  const [playerName, setPlayerName] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<string>(getRandomColor());
  const [error, setError] = useState<string | undefined>();

  const handleGameStart = (isCpuGame: boolean) => {
    if (playerName.length === 0) {
      setError('Name is required...');
    } else {
      onComplete(playerName, playerColor, isCpuGame);
    }
  };

  return (
    <div className="splash-view-container">
      <GroupBox>
        <div className="splash-view-items">
          <h1>Battle Snakes</h1>
          <GroupBox label="Name">
            <TextInput placeholder="Enter your name" onChange={(e) => setPlayerName(e.target.value)} />
            {error && <span style={{ color: 'red' }}>{error}</span>}
          </GroupBox>
          <span className="color-input">
            Select snake color: {'  '}
            <ColorInput defaultValue={playerColor} onChange={(e) => setPlayerColor(e.target.value)} />
          </span>
          <Button onClick={() => handleGameStart(false)}>Play Online</Button>
          <Button onClick={() => handleGameStart(true)}>Play Against CPU</Button>
        </div>
      </GroupBox>
    </div>
  );
}
