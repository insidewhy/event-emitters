import { EventEmitter } from './EventEmitter'
import { Listener } from './EventSource'

/**
 * This is the same as EventEmitterWithCurrent but the "current value" is optional
 */
export class EventEmitterWithOptionalCurrent<T> extends EventEmitter<T> {
  public currentMessage: T | undefined
  // "undefined" might be a valid message so use this
  public hasCurrentMessage: boolean

  constructor(initialMessage?: T) {
    super()
    if (arguments.length) {
      this.currentMessage = initialMessage
      this.hasCurrentMessage = true
    } else {
      this.hasCurrentMessage = false
    }
  }

  emit(newMessage: T): void {
    this.hasCurrentMessage = true
    this.currentMessage = newMessage
    super.emit(newMessage)
  }

  subscribe(listener: Listener<T>): Listener<T> {
    super.subscribe(listener)
    if (this.hasCurrentMessage) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      listener(this.currentMessage!)
    }
    return listener
  }
}
