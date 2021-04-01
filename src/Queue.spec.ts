import { Queue } from './Queue'

describe('Queue', () => {
  it('can queue and dequeue 3 items', () => {
    const queue = new Queue()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.length).toEqual(3)
    expect(queue.dequeue()).toEqual(1)
    expect(queue.length).toEqual(2)
    expect(queue.dequeue()).toEqual(2)
    expect(queue.dequeue()).toEqual(3)
    expect(queue.length).toEqual(0)
  })

  it('moves elements before head to end after capacity increase when head is in first half', () => {
    // set up 45123
    const queue = new Queue(5)
    queue.enqueue(98)
    queue.enqueue(99)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.dequeue()).toEqual(98)
    expect(queue.dequeue()).toEqual(99) // xx123
    queue.enqueue(4) // 4x123
    queue.enqueue(5) // 45123
    expect(queue.length).toEqual(5)
    // exceed current capacity
    queue.enqueue(6) // ee123456ee

    // then fill up to the new capacity
    queue.enqueue(7)
    queue.enqueue(8)
    queue.enqueue(9)
    queue.enqueue(10) // 9a12345678
    expect(queue.length).toEqual(10)

    // ensure everything is in order
    for (let i = 1; i <= 10; ++i) {
      expect(queue.dequeue()).toEqual(i)
    }
    expect(queue.length).toEqual(0)
  })

  it('moves elements after tail to end after capacity increase when head is in last half', () => {
    // set up 34512
    const queue = new Queue(5)
    queue.enqueue(97)
    queue.enqueue(98)
    queue.enqueue(99)
    queue.enqueue(1)
    queue.enqueue(2)
    expect(queue.dequeue()).toEqual(97)
    expect(queue.dequeue()).toEqual(98)
    expect(queue.dequeue()).toEqual(99) // xxx12
    queue.enqueue(3) // 3xx12
    queue.enqueue(4) // 34x12
    queue.enqueue(5) // 34512
    expect(queue.length).toEqual(5)
    // exceed current capacity
    queue.enqueue(6) // 3456eeee12

    // then fill up to the new capacity
    queue.enqueue(7)
    queue.enqueue(8)
    queue.enqueue(9)
    queue.enqueue(10) // 3456789012
    expect(queue.length).toEqual(10)

    // ensure everything is in order
    for (let i = 1; i <= 10; ++i) {
      expect(queue.dequeue()).toEqual(i)
    }
    expect(queue.length).toEqual(0)
  })

  it('throws an error when trying to dequeue nonexistent item', () => {
    const queue = new Queue()
    queue.enqueue(1)
    expect(queue.dequeue()).toEqual(1)
    expect(() => {
      queue.dequeue()
    }).toThrowError()
  })

  it('can queue past initial capacity of circular buffer', () => {
    const queue = new Queue()
    const moreThanCapacity = 17
    for (let i = 0; i < moreThanCapacity; ++i) {
      queue.enqueue(i)
    }
    expect(queue.length).toEqual(moreThanCapacity)
    for (let i = 0; i < moreThanCapacity; ++i) {
      expect(queue.dequeue()).toEqual(i)
    }
    expect(queue.length).toEqual(0)
  })

  it('supports interleaved queues and dequeues', () => {
    const queue = new Queue()
    queue.enqueue(1)
    queue.enqueue(2)
    expect(queue.dequeue()).toEqual(1)
    queue.enqueue(3)
    queue.enqueue(4)
    expect(queue.dequeue()).toEqual(2)
    queue.enqueue(5)
    queue.enqueue(6)
    expect(queue.dequeue()).toEqual(3)
    expect(queue.dequeue()).toEqual(4)
    expect(queue.dequeue()).toEqual(5)
    expect(queue.dequeue()).toEqual(6)
  })

  it('supports a large number of interleaved queues and dequeues', () => {
    const initialSize = 4
    const queue = new Queue()
    for (let i = 0; i < initialSize; ++i) {
      queue.enqueue(i)
    }
    let nextRead = 0
    let nextWrite = initialSize
    for (let i = 0; i < 10000; ++i) {
      if (nextRead === nextWrite || Math.random() < 0.5) {
        queue.enqueue(nextWrite++)
      } else {
        expect(queue.dequeue()).toEqual(nextRead++)
      }
    }

    for (; nextRead < nextWrite; ++nextRead) {
      expect(queue.dequeue()).toEqual(nextRead)
    }
  })
})
