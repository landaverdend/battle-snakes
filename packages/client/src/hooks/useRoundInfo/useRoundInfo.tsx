import { ClientGameState } from '@/game/ClientGameState';
import { RoundInfo, RoundState, SharedGameState } from '@battle-snakes/shared';
import { useEffect, useRef, useState } from 'react';

export function useRoundInfo() {
  // State for rendering
  const [roundInfo, setRoundInfo] = useState<RoundInfo>({
    roundState: RoundState.WAITING,
    roundIntermissionEndTime: null,
    roundNumber: 0,
  });
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

  return { roundInfo };
}
