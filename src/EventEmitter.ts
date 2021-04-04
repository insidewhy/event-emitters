import { EventEmitterAsyncIterator } from './EventEmitterAsyncIterator'
import { EventSink } from './EventSink'
import { EventSource, Listener } from './EventSource'

/**
 * The same as node's EventEmitter but:
 * Only emits a single "event".
 * Throw an exception when a client registers the same listener more than once.
 * Throw an exception when a client tries to remove a listener that is not listening.
 */
export class EventEmitter<T> implements EventSink<T>, EventSource<T>, AsyncIterable<T> {
  protected listeners: Listener<T>[] = []

  emit(newMessage: T): void {
    this.listeners.forEach((listener) => {
      listener(newMessage)
    })
  }

  subscribe(listener: Listener<T>): Listener<T> {
    if (this.listeners.includes(listener)) {
      throw new Error('You have already subscribed with this listener')
    }

    this.listeners.push(listener)
    return listener
  }

  unsubscribe(listener: Listener<T>): void {
    const index = this.listeners.indexOf(listener)
    if (index === -1) {
      throw new Error('Tried to remove listener that is not listening')
    }
    this.listeners.splice(index, 1)
  }

  hasListeners(): boolean {
    return this.listeners.length !== 0
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.asyncIterator()
  }

  asyncIterator(): AsyncIterator<T> {
    return new EventEmitterAsyncIterator<T>(this)
  }
}
