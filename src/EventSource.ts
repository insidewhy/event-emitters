export type Listener<T> = (message: T) => void

export interface EventSource<T> {
  subscribe(listener: Listener<T>): Listener<T>

  unsubscribe(listener: Listener<T>): void
}

export interface EventSourceWithCurrent<T> extends EventSource<T> {
  currentMessage: T
}
