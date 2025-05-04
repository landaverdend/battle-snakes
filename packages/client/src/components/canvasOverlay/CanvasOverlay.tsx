import './canvas-overlay.css';
import { useEffect, useState } from 'react';
import { RoundState } from '@battle-snakes/shared';
import { useRoundInfo } from '@/hooks/useRoundInfo';
import { useLeaderboard } from '@/hooks/useLeaderboard';

export function CanvasOverlay() {
  const { roundInfo } = useRoundInfo();
  const { players } = useLeaderboard();

  const [displayMessage, setDisplayMessage] = useState<string>('');
  const [shouldDisplay, setShouldDisplay] = useState<boolean>(false);

  // Effect for managing the countdown timer display logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const { roundState, roundIntermissionEndTime } = roundInfo;
    console.log('roundinfo was changed', roundInfo);

    // Function to update the countdown string
    const updateCountdown = () => {
      if (roundIntermissionEndTime !== null) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((roundIntermissionEndTime - now) / 1000));
        if (remaining <= 0) {
          setShouldDisplay(false);
          setDisplayMessage('GO!!');
        } else {
          setDisplayMessage(`${remaining}`);
        }
        // Stop the interval early if the timer reaches zero
        if (remaining <= 0 && intervalId) {
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

    if (roundInfo.roundState !== RoundState.WAITING && alive.length === 1) {
      setDisplayMessage(`${alive[0]?.name} wins! +50 points!`);
      setShouldDisplay(true);
    } else {
    }
  }, [players]);

  return <>{shouldDisplay && <div className="canvas-overlay-container">{displayMessage}</div>}</>;
}
