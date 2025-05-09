import { RoundState, SharedGameState } from '@battle-snakes/shared';
import ObservableStateManager from './ObservableStateManager';

export class ClientGameState extends ObservableStateManager<SharedGameState> {
  private static instance: ClientGameState;

  private constructor() {
    const initialState: SharedGameState = {
      players: [],
      grid: {},
      gridSize: 0,
      roundInfo: {
        roundState: RoundState.WAITING,
        roundIntermissionEndTime: null,
        roundNumber: 0,
      },
      timestamp: 0,
    };
    super(initialState);
  }

  public static getInstance(): ClientGameState {
    if (!ClientGameState.instance) {
      ClientGameState.instance = new ClientGameState();
    }
    return ClientGameState.instance;
  }

  public isRoundActive(): boolean {
    return this.state.roundInfo.roundState === RoundState.ACTIVE;
  }
}
