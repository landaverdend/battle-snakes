import './canvas-overlay.css';
import { useEffect, useState } from 'react';
import { PlayerData, RoundInfo, ROUNDS_PER_GAME, RoundState } from '@battle-snakes/shared';
import { useRoundInfo } from '@/hooks/useRoundInfo';
import { useLeaderboard } from '@/hooks/useLeaderboard';

export function CanvasOverlay() {
  const { roundInfo } = useRoundInfo();
  const { players } = useLeaderboard();

  const [shouldDisplay, setShouldDisplay] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Effect for managing the countdown timer display logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const { roundState, roundIntermissionEndTime } = roundInfo;

    // Function to update the countdown string
    const updateCountdown = () => {
      if (roundIntermissionEndTime !== null) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((roundIntermissionEndTime - now) / 1000));
        if (remaining <= 0) {
          setShouldDisplay(false);
        } else {
          setCountdown(remaining);
        }
        // Stop the interval early if the timer reaches zero
        if (remaining <= 0 && intervalId) {
          setCountdown(null);
          clearInterval(intervalId);
          intervalId = null; // Clear the interval ID
        }
      }
    };

    if (roundState !== RoundState.ACTIVE && roundIntermissionEndTime !== null) {
      updateCountdown();
      // Set an interval to update the countdown every ~second
      intervalId = setInterval(updateCountdown, 1000); // Use 500ms for smoother updates
    }

    if (roundState === RoundState.INTERMISSION) {
      setShouldDisplay(true);
    } else {
      setShouldDisplay(false);
    }

    // Cleanup interval when the component unmounts or dependencies change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [roundInfo]);

  useEffect(() => {
    const alive = players.filter((p) => p.isAlive);

    if (roundInfo.roundState !== RoundState.WAITING && alive.length <= 1) {
      setShouldDisplay(true);
    }
  }, [players]);

  return (
    <>
      {shouldDisplay && (
        <div className="canvas-overlay-container">
          <DisplayMessage roundInfo={roundInfo} players={players} countdown={countdown} />
        </div>
      )}
    </>
  );
}

type DMProps = {
  roundInfo: RoundInfo;
  players: PlayerData[];
  countdown: number | null;
};
function DisplayMessage({ roundInfo, players, countdown }: DMProps) {
  const isGameOver = roundInfo.roundNumber === ROUNDS_PER_GAME;
  const survivor = players.find((p) => p.isAlive);

  let toRender = <></>;
  if (countdown !== null) {
    toRender = <span>{countdown}</span>;
  } else if (isGameOver) {
    toRender = <span>Game Over!</span>;
  } else {
    toRender = (
      <>
        Round Over! 
        {survivor && (
          <>
            <span style={{ color: survivor.color }}>{survivor.name}</span> survived! <span style={{ color: 'green' }}>+50</span>
          </>
        )}
      </>
    );
  }

  return <span>{toRender}</span>;
}
