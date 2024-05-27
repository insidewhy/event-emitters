const INITIAL_CAPACITY = 16

/**
 * An efficient queue implemented with a circular buffer. It implements just enough
 * interface to be useful to EventEmitterAsyncIterator.
 */
export class Queue<T> {
  private buffer: Array<T | undefined>
  private headIndex = 0
  private tailIndex = -1

  // writing to this would corrupt the Queue but disallowing it would incur a performance hit
  length = 0

  constructor(capacity = INITIAL_CAPACITY) {
    this.buffer = new Array(capacity)
  }

  enqueue(item: T): void {
    if (this.length === this.buffer.length) {
      const prevCapacity = this.buffer.length
      this.buffer.length *= 2
      if (this.headIndex / prevCapacity <= 0.5) {
        if (this.headIndex !== 0) {
          // move elements before head after tail
          for (let i = 0; i < this.headIndex; ++i) {
            this.buffer[prevCapacity + i] = this.buffer[i]
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.buffer[i]
          }
          this.tailIndex += prevCapacity
        }
      } else {
        for (let i = this.tailIndex + 1; i < prevCapacity; ++i) {
          this.buffer[prevCapacity + i] = this.buffer[i]
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete this.buffer[i]
        }
        this.headIndex += prevCapacity
      }
    }

    this.tailIndex = (this.tailIndex + 1) % this.buffer.length
    this.buffer[this.tailIndex] = item
    ++this.length
  }

  dequeue(): T {
    if (this.length === 0) {
      throw new Error('Cannot dequeue from empty Queue')
    }
    --this.length
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = this.buffer[this.headIndex]!
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.buffer[this.headIndex]
    this.headIndex = (this.headIndex + 1) % this.buffer.length
    return item
  }

  // clear the buffer and leave a corrupt useless buggy object remaining
  destroy(): void {
    this.buffer.length = 0
  }
}
