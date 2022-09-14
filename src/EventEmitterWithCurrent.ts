import { EventEmitter } from './EventEmitter'
import { EventSourceWithCurrent, Listener } from './EventSource'

/**
 * This is the same as EventEmitter but:
 * Is initialized with the current message.
 * Emits the current message to each listener as soon as it subscribes.
 */
export class EventEmitterWithCurrent<T>
  extends EventEmitter<T>
  implements EventSourceWithCurrent<T> {
  public currentMessage: T

  constructor(initialMessage: T) {
    super()
    this.currentMessage = initialMessage
  }

  emit(newMessage: T): void {
    this.currentMessage = newMessage
    super.emit(newMessage)
  }

  subscribe(listener: Listener<T>): Listener<T> {
    super.subscribe(listener)
    listener(this.currentMessage)
    return listener
  }
}
