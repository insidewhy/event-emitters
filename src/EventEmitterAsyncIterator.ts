import { EventSource } from './EventSource'

export class EventEmitterAsyncIterator<T> implements AsyncIterator<T> {
  constructor(private readonly eventSource: EventSource<T>) {}

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
