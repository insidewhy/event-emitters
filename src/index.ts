type Listener<T> = (message: T) => void

/**
 * The same as node's EventEmitter but:
 * Only emits a single "event".
 * Throw an exception when a client registers the same listener more than once.
 * Throw an exception when a client tries to remove a listener that is not listening.
 */
export class EventEmitter<T> {
  protected listeners: Listener<T>[] = []

  emit(newMessage: T): void {
    this.listeners.forEach((listener) => {
      listener(newMessage)
    })
  }

  subscribe(listener: Listener<T>): void {
    if (this.listeners.includes(listener)) {
      throw new Error('You have already subscribed with this listener')
    }

    this.listeners.push(listener)
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

class EventEmitterAsyncIterator<T> implements AsyncIterator<T> {
  constructor(private readonly eventEmitter: EventEmitter<T>) {}

  next(): Promise<IteratorResult<T, undefined>> {
    // TODO: keep getting values form event emitter
    return Promise.resolve({ done: true, value: undefined })
  }

  return(): Promise<IteratorResult<T, undefined>> {
    // TODO: unsubscribe
    return Promise.resolve({ value: undefined, done: true })
  }

  throw(error: Error): Promise<IteratorResult<T, undefined>> {
    // TODO: unsubscribe
    return Promise.reject(error)
  }
}

/**
 * This is the same as EventEmitter but:
 * Is initialized with the current message.
 * Emits the current message to each listener as soon as it subscribes.
 */
export class EventEmitterWithCurrent<T> extends EventEmitter<T> {
  public currentMessage: T

  constructor(initialMessage: T) {
    super()
    this.currentMessage = initialMessage
  }

  emit(newMessage: T): void {
    this.currentMessage = newMessage
    super.emit(newMessage)
  }

  subscribe(listener: Listener<T>): void {
    super.subscribe(listener)
    listener(this.currentMessage)
  }
}

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
  subscribe(listener: Listener<T>): void {
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
  }
}
