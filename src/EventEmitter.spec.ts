import { EventEmitter } from './EventEmitter'

describe('EventEmitter', () => {
  /* eslint-disable @typescript-eslint/explicit-function-return-type */
  let emitter = new EventEmitter<number>()

  beforeEach(() => {
    emitter = new EventEmitter<number>()
  })

  it('updates subscribed listener with statuses as they change', () => {
    let current: number | undefined
    emitter.subscribe((newVal: number) => {
      current = newVal
    })
    expect(current).toEqual(undefined)

    const secondVal = 2
    emitter.emit(secondVal)
    expect(current).toEqual(secondVal)
  })

  it('supports multiple listeners', () => {
    let current1: number | undefined
    let current2: number | undefined
    emitter.subscribe((newVal: number) => {
      current1 = newVal
    })
    emitter.subscribe((newVal: number) => {
      current2 = newVal
    })
    expect(current1).toEqual(undefined)
    expect(current2).toEqual(undefined)

    const secondVal = 2
    emitter.emit(secondVal)
    expect(current1).toEqual(secondVal)
    expect(current2).toEqual(secondVal)
  })

  it('stops updating a listener after `unsubscribe` is called', () => {
    let current1: number | undefined
    let current2: number | undefined

    const secondListener = (newVal: number): void => {
      current2 = newVal
    }
    emitter.subscribe((newVal: number) => {
      current1 = newVal
    })
    emitter.subscribe(secondListener)
    expect(current1).toEqual(undefined)
    expect(current2).toEqual(undefined)

    const secondVal = 2
    emitter.emit(secondVal)
    expect(current1).toEqual(secondVal)
    expect(current2).toEqual(secondVal)

    emitter.unsubscribe(secondListener)
    const thirdVal = 3
    emitter.emit(thirdVal)
    expect(current1).toEqual(thirdVal)
    expect(current2).toEqual(secondVal)
  })

  it('throws an error when trying to subscribe the same listener twice', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const listener = () => {}
    emitter.subscribe(listener)
    expect(() => {
      emitter.subscribe(listener)
    }).toThrow()
  })

  it('throws an error when trying to unsubscribe a listener that is not listening', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const listener1 = () => {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const listener2 = () => {}
    emitter.subscribe(listener1)
    expect(() => {
      emitter.unsubscribe(listener2)
    }).toThrow()
  })

  describe('async iterator', () => {
    it('can be iterated over in order using "for await" loop', async () => {
      const allVals: number[] = []
      async function iterate(iterator: EventEmitter<number>) {
        for await (const val of iterator) {
          allVals.push(val)
          if (val === 3) break
        }
      }
      const promise = iterate(emitter)
      emitter.emit(1)
      emitter.emit(2)
      emitter.emit(3)
      expect(emitter.hasListeners()).toEqual(true)
      await expect(promise).resolves.not.toThrow()
      expect(allVals).toEqual([1, 2, 3])
      // ensure that the iterator's return() method was called
      expect(emitter.hasListeners()).toEqual(false)
    })

    it('queues calls to next() such that emissions are delivered in sequence via emitted queue', async () => {
      const iterator = emitter.asyncIterator()
      // by calling emit() before next() the emitted items are queued via iterator.emitted
      emitter.emit(1)
      emitter.emit(2)
      emitter.emit(3)
      const vals = await Promise.all([iterator.next(), iterator.next(), iterator.next()])
      expect(vals).toEqual([
        { done: false, value: 1 },
        { done: false, value: 2 },
        { done: false, value: 3 },
      ])
    })

    it('queues calls to next such that emissions are delivered in sequence via pending listener queue', async () => {
      const iterator = emitter.asyncIterator()
      // by calling next() before emit() the pending listeners are queued via iterator.pendingListens
      const promises = [iterator.next(), iterator.next(), iterator.next()]
      emitter.emit(1)
      emitter.emit(2)
      emitter.emit(3)
      expect(await Promise.all(promises)).toEqual([
        { done: false, value: 1 },
        { done: false, value: 2 },
        { done: false, value: 3 },
      ])
    })
  })
})
