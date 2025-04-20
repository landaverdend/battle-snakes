import { RoundInfo, RoundState, SharedGameState } from '@battle-snakes/shared';
import { ClientGameState } from '@/game/ClientGameState'; // Adjust path if needed
import './round-header.css';
import { useEffect, useState, useRef } from 'react'; // Import hooks

export default function RoundHeader() {
  // State for rendering
  const [roundInfo, setRoundInfo] = useState<RoundInfo>({
    roundState: RoundState.WAITING,
    roundIntermissionEndTime: null,
    roundNumber: 0,
  });
  const [countdown, setCountdown] = useState<string>('');
  const memoizedRoundInfo = useRef<RoundInfo>({
    roundState: RoundState.WAITING,
    roundIntermissionEndTime: null,
    roundNumber: 0,
  });

  // Effect for subscribing to game state updates
  useEffect(() => {
    const gameStateManager = ClientGameState.getInstance();

    const handleStateUpdate = ({ roundInfo }: SharedGameState) => {
      const roundInfoChanged = roundInfo.roundState !== memoizedRoundInfo.current.roundState;

      // Only call React state setters if the relevant data *actually* changed
      if (roundInfoChanged) {
        setRoundInfo(roundInfo);
        memoizedRoundInfo.current = roundInfo;
      }
    };

    // Get initial state and set it immediately
    const initialState = gameStateManager.getState();
    setRoundInfo(initialState.roundInfo);

    // IMPORTANT: Initialize refs with the initial state too
    memoizedRoundInfo.current = initialState.roundInfo;

    // Subscribe to future updates
    gameStateManager.addListener(handleStateUpdate);

    // Cleanup: Unsubscribe on component unmount
    return () => {
      gameStateManager.removeListener(handleStateUpdate);
    };
  }, []);

  // Effect for managing the countdown timer display logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const { roundState, roundIntermissionEndTime } = roundInfo;

    // Function to update the countdown string
    const updateCountdown = () => {
      if (roundIntermissionEndTime !== null) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((roundIntermissionEndTime - now) / 1000));
        setCountdown(`${remaining}s`);
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
      intervalId = setInterval(updateCountdown, 500); // Use 500ms for smoother updates
    }

    // Cleanup interval when the component unmounts or dependencies change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [roundInfo]);

  // Render the countdown string
  return (
    <div className="round-header-container">
      <div className="item">Round Number: {roundInfo.roundNumber}</div>
      <div className="item">Round Status: {roundInfo.roundState}</div>
      {roundInfo.roundState !== RoundState.ACTIVE && <div className="item">New Round in: {countdown} </div>}
    </div>
  );
}
