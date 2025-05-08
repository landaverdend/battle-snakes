export default class StateManager<T> {
  protected state: T;
  private listeners: ((data: T) => void)[] = [];

  protected constructor(initialState: T) {
    this.state = initialState;
  }

  public addListener(listener: (data: T) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (data: T) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /**
   * THIS DOESNT WORK FOR STATE ARRAYS. OVERRIDE THIS METHOD WHEN THE STATE IS AN ARRAY
   */
  public updateState(newState: T): void {
    this.state = { ...newState };
    this.notifyListeners(this.state);
  }

  public getState(): T {
    return this.state;
  }

  protected notifyListeners(data: T): void {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        // It's good practice to catch errors in listeners
        // so one misbehaving listener doesn't break the chain.
        console.error('Error in StateManager listener:', error);
      }
    });
  }
}
