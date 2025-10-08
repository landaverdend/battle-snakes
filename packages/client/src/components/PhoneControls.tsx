import { useGameContext } from '@/state/GameContext';
import { Direction } from '@battle-snakes/shared';
import { Button, Frame } from 'react95';

// const inputHandler =

export const PhoneControls = () => {
  const { gameRunner } = useGameContext();

  const onPress = (dir: Direction) => {
    if (gameRunner) {
      gameRunner.handleInput(dir);
    }
  };

  return (
    <Frame className="">
      <div className="grid grid-cols-3 grid-rows-3 gap-2">
        <div></div>
        <Button className="col-start-2 row-start-1" onClick={() => onPress('up')}>
          ▲
        </Button>
        <div></div>

        <Button className="col-start-1 row-start-2" onClick={() => onPress('left')}>
          ◀
        </Button>
        <div></div>
        <Button className="col-start-3 row-start-2" onClick={() => onPress('right')}>
          ▶
        </Button>

        <div></div>
        <Button className="col-start-2 row-start-3" onClick={() => onPress('down')}>
          ▼
        </Button>
        <div></div>
      </div>
    </Frame>
  );
};
