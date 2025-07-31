export default class ObservableStateManager<T> {
  protected state: T;
  private listeners: ((data: T) => void)[] = [];

  protected constructor(initialState: T) {
    this.state = initialState;
  }

  public subscribe(listener: (data: T) => void): void {
    this.listeners.push(listener);
  }

  public unsubscribe(listener: (data: T) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /**
   * THIS DOESNT WORK FOR STATE ARRAYS. OVERRIDE THIS METHOD WHEN THE STATE IS AN ARRAY
   */
  public publish(data: T): void {
    if (Array.isArray(data)) {
      this.state = [...data] as any as T;
    } else if (typeof data === 'object') {
      this.state = { ...data };
    } else {
      this.state = data;
    }

    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        // It's good practice to catch errors in listeners
        // so one misbehaving listener doesn't break the chain.
        console.error('Error in StateManager listener:', error);
      }
    });
  }

  public getState(): T {
    return this.state;
  }
}
