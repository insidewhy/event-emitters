import { EventSource, Listener } from './EventSource'
import { Queue } from './Queue'

/**
 * An async iterator implemented with an efficient queue.
 *
 * Make the async iterator also fulfil AsyncIterable, which is pretty pointless
 * but needed to support certain APIs that are not implemented correctly.
 */
export class EventEmitterAsyncIterator<T> implements AsyncIterator<T>, AsyncIterable<T> {
  private readonly emitted: Queue<T> = new Queue<T>()
  // this will only contain listeners when `emitted` is empty
  private readonly pendingListens = new Queue<Listener<IteratorResult<T, undefined>>>()

  constructor(private readonly eventSource: EventSource<T>) {
    this.onEmit = this.onEmit.bind(this)
    eventSource.subscribe(this.onEmit)
  }

  private onEmit(value: T) {
    if (this.pendingListens.length) {
      this.pendingListens.dequeue()({ done: false, value })
    } else {
      this.emitted.enqueue(value)
    }
  }

  next(): Promise<IteratorResult<T, undefined>> {
    if (this.emitted.length) {
      return Promise.resolve({ done: false, value: this.emitted.dequeue() })
    } else {
      return new Promise<IteratorResult<T, undefined>>((resolve) => {
        this.pendingListens.enqueue(resolve)
      })
    }
  }

  return(): Promise<IteratorResult<T, undefined>> {
    this.eventSource.unsubscribe(this.onEmit)
    this.emitted.destroy()
    this.pendingListens.destroy()
    return Promise.resolve({ value: undefined, done: true })
  }

  throw(error: Error): Promise<IteratorResult<T, undefined>> {
    this.eventSource.unsubscribe(this.onEmit)
    this.emitted.destroy()
    this.pendingListens.destroy()
    return Promise.reject(error)
  }

  // *sigh*
  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this
  }
}
