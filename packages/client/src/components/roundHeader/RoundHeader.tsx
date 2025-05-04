import './round-header.css';
import { Counter, Frame } from 'react95';
import { useRoundInfo } from '@/hooks/useRoundInfo';

export default function RoundHeader() {
  const { roundInfo } = useRoundInfo();

  return (
    <div className="round-header-container">
      <Frame className="round-number-container">
        <h2>Round Number:</h2>
        <Counter value={roundInfo.roundNumber} minLength={2} size="lg" />
      </Frame>
    </div>
  );
}
