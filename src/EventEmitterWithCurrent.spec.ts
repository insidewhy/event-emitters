import { EventEmitterWithCurrent } from './EventEmitterWithCurrent'

describe('EventEmitterWithCurrent', () => {
  /* eslint-disable @typescript-eslint/explicit-function-return-type */

  const defaultVal = 1
  const createEventEmitter = () => new EventEmitterWithCurrent<number>(defaultVal)

  let emitter = createEventEmitter()

  beforeEach(() => {
    emitter = createEventEmitter()
  })

  it('sends current status when listener first subscribes', () => {
    let current: number | undefined
    emitter.subscribe((newVal: number) => {
      current = newVal
    })
    expect(current).toEqual(defaultVal)
  })

  it('updates subscribed listener with statuses as they change', () => {
    let current: number | undefined
    emitter.subscribe((newVal: number) => {
      current = newVal
    })

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
    expect(current1).toEqual(defaultVal)
    expect(current2).toEqual(defaultVal)

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
    expect(current1).toEqual(defaultVal)
    expect(current2).toEqual(defaultVal)

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

  describe('async iterator', () => {
    it('includes current value as first value', async () => {
      const allVals: number[] = []
      async function iterate(iterator: EventEmitterWithCurrent<number>) {
        for await (const val of iterator) {
          allVals.push(val)
          if (val === 4) break
        }
      }
      const promise = iterate(emitter)
      emitter.emit(2)
      emitter.emit(3)
      emitter.emit(4)
      expect(emitter.hasListeners()).toEqual(true)
      await expect(promise).resolves.not.toThrow()
      expect(allVals).toEqual([1, 2, 3, 4])
      expect(emitter.hasListeners()).toEqual(false)

      allVals.splice(0)
      await iterate(emitter)
      expect(allVals).toEqual([4])
      expect(emitter.hasListeners()).toEqual(false)
    })
  })
})
