import { EventEmitter } from './EventEmitter'
import { Listener } from './EventSource'

/**
 * Acts the same as EventEmitter but queues messages when there are no subscribers, delivering them
 * as soon as the first subscriber subscribes.
 */
export class QueueingEventEmitter<T> extends EventEmitter<T> {
  private messageQueue: T[] = []

  emit(newMessage: T): void {
    if (!this.listeners.length) {
      this.messageQueue.push(newMessage)
    } else {
      super.emit(newMessage)
    }
  }

  /**
   * The queue will still be drained if the subscriber throws error, in the case that the
   * there are multiple messages with multiple exceptions thrown, only the last one will
   * be re-thrown.
   */
  subscribe(listener: Listener<T>): Listener<T> {
    super.subscribe(listener)
    if (this.messageQueue.length) {
      let error: Error | undefined
      this.messageQueue.forEach((queuedMessage) => {
        try {
          super.emit(queuedMessage)
        } catch (e) {
          error = e
        }
      })
      this.messageQueue.splice(0)
      if (error) {
        throw error
      }
    }
    return listener
  }
}
