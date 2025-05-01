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

  return (
    <div className="splash-view-container">
      <GroupBox>
        <div className="splash-view-items">
          {' '}
          <h1>Battle Snakes</h1>
          <GroupBox label="Name">
            <TextInput placeholder="Enter your name" onChange={(e) => setPlayerName(e.target.value)} />
          </GroupBox>
          <span className={'color-input'}>
            Select snake color: {'  '}
            <ColorInput defaultValue={playerColor} onChange={(e) => setPlayerColor(e.target.value)} />
          </span>
          <Button onClick={() => onComplete(playerName, playerColor, false)}>Play Online</Button>
          <Button onClick={() => onComplete(playerName, playerColor, true)}>Play Against CPU</Button>
        </div>
      </GroupBox>
    </div>
  );
}
