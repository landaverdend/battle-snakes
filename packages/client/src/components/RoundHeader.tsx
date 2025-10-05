import { Counter, Frame } from 'react95';
import { useRoundInfo } from '@/hooks/useRoundInfo';
import Draggable from 'react-draggable';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Sizes } from 'react95/dist/types';

export default function RoundHeader() {
  const { roundInfo } = useRoundInfo();
  const windowSize = useWindowSize();

  let size: Sizes = 'md';
  if (windowSize.width > 768) {
    size = 'md';
  } else if (windowSize.width > 1024) {
    size = 'lg';
  }

  return (
    <div className="flex flex-row justify-center items-center gap-6.5 p-2.5 rounded-md">
      <Draggable handle=".handle" defaultPosition={{ x: 0, y: 0 }} scale={1}>
        <Frame className="!p-2.5 !flex !flex-col !items-center !justify-center handle">
          <h2>Round Number</h2>
          <Counter value={roundInfo.roundNumber} minLength={2} size={size} className="" />
        </Frame>
      </Draggable>
    </div>
  );
}
