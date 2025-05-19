import { ClientSpecificData } from '@battle-snakes/shared';
import ObservableStateManager from './ObservableStateManager';

export function publishClientSpecificData(data: ClientSpecificData) {
  ClientPlayerObservable.getInstance().publish(data);
}

export class ClientPlayerObservable extends ObservableStateManager<ClientSpecificData> {
  private static instance: ClientPlayerObservable;

  private constructor() {
    const initialState: ClientSpecificData = {};
    super(initialState);
  }

  public static getInstance(): ClientPlayerObservable {
    if (!ClientPlayerObservable.instance) {
      ClientPlayerObservable.instance = new ClientPlayerObservable();
    }

    return ClientPlayerObservable.instance;
  }
}
