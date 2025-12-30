import { useGameContext } from '@/state/GameContext';
import { Direction } from '@battle-snakes/shared';
import { Button, Frame } from 'react95';
import { useCallback } from 'react';

export const PhoneControls = () => {
  const { gameRunner } = useGameContext();

  const onPress = useCallback(
    (dir: Direction) => {
      if (gameRunner) {
        gameRunner.handleInput(dir);
      }
    },
    [gameRunner]
  );

  // Touch handler for faster mobile response
  const handleTouch = (dir: Direction) => (e: React.TouchEvent) => {
    e.preventDefault();
    onPress(dir);
  };

  const buttonClass = 'touch-btn !min-w-[60px] !min-h-[60px] !text-2xl select-none';

  return (
    <Frame className="p-2">
      <div className="grid grid-cols-3 grid-rows-3 gap-3 w-fit">
        <div></div>
        <Button
          className={`col-start-2 row-start-1 ${buttonClass}`}
          onClick={() => onPress('up')}
          onTouchStart={handleTouch('up')}
        >
          ▲
        </Button>
        <div></div>

        <Button
          className={`col-start-1 row-start-2 ${buttonClass}`}
          onClick={() => onPress('left')}
          onTouchStart={handleTouch('left')}
        >
          ◀
        </Button>
        <div></div>
        <Button
          className={`col-start-3 row-start-2 ${buttonClass}`}
          onClick={() => onPress('right')}
          onTouchStart={handleTouch('right')}
        >
          ▶
        </Button>

        <div></div>
        <Button
          className={`col-start-2 row-start-3 ${buttonClass}`}
          onClick={() => onPress('down')}
          onTouchStart={handleTouch('down')}
        >
          ▼
        </Button>
        <div></div>
      </div>
    </Frame>
  );
};
