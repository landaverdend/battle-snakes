import { useState } from 'react';
import { getRandomColor } from '@battle-snakes/shared';
import { Button, ColorInput, GroupBox, TextInput, Window, WindowHeader } from 'react95';

type SVProps = {
  onComplete: (playerName: string, playerColor: string, isCpuGame: boolean) => void;
};
export default function SplashView({ onComplete }: SVProps) {
  const [playerName, setPlayerName] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<string>(getRandomColor());
  const [error, setError] = useState<string | undefined>();

  const handleGameStart = (isCpuGame: boolean) => {
    if (playerName.length === 0) {
      setError('Name is required');
    } else if (playerName.length > 12) {
      setError('Name must be less than 12 characters');
    } else {
      onComplete(playerName, playerColor, isCpuGame);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-2 h-screen w-screen bg-windows-bg">
      <Window>
        <WindowHeader>snakes.exe</WindowHeader>
        <div className="flex flex-col justify-center items-center gap-6 !p-3.5">
          <h1 className="!text-[2.5rem]">Battle Snakes</h1>
          <GroupBox label="Name">
            <TextInput placeholder="Enter your name" onChange={(e) => setPlayerName(e.target.value)} />
            {error && <span className="!text-red-500">{error}</span>}
          </GroupBox>
          <span className="flex items-center gap-2.5">
            Select snake color: {'  '}
            <ColorInput defaultValue={playerColor} onChange={(e) => setPlayerColor(e.target.value)} />
          </span>
          <Button onClick={() => handleGameStart(false)}>Play Online</Button>
          <Button onClick={() => handleGameStart(true)}>Play Against CPU</Button>
        </div>
      </Window>
    </div>
  );
}
