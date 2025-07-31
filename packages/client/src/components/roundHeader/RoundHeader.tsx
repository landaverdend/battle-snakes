import './round-header.css';
import { Counter, Frame } from 'react95';
import { useRoundInfo } from '@/hooks/useRoundInfo';
import Draggable from 'react-draggable';

export default function RoundHeader() {
  const { roundInfo } = useRoundInfo();

  return (
    <div className="round-header-container">
      <Draggable handle=".handle" defaultPosition={{ x: 0, y: 0 }} scale={1}>
        <Frame className="round-number-container handle">
          <h2>Round Number:</h2>
          <Counter value={roundInfo.roundNumber} minLength={2} size="lg" />
        </Frame>
      </Draggable>
    </div>
  );
}
