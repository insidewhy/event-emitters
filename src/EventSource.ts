export type Listener<T> = (message: T) => void

export interface EventSource<T> {
  subscribe(listener: Listener<T>): Listener<T>

  unsubscribe(listener: Listener<T>): void
}
