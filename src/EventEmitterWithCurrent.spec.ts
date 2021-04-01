import { EventEmitterWithCurrent } from './EventEmitterWithCurrent'

describe('EventEmitterWithCurrent', () => {
  /* eslint-disable @typescript-eslint/explicit-function-return-type */

  const defaultVal = 'first'
  const createEventEmitter = () => new EventEmitterWithCurrent<string>(defaultVal)

  let emitter = createEventEmitter()

  beforeEach(() => {
    emitter = createEventEmitter()
  })

  it('sends current status when listener first subscribes', () => {
    let current: string | undefined
    emitter.subscribe((newVal: string) => {
      current = newVal
    })
    expect(current).toEqual(defaultVal)
  })

  it('updates subscribed listener with statuses as they change', () => {
    let current: string | undefined
    emitter.subscribe((newVal: string) => {
      current = newVal
    })

    const secondVal = 'second'
    emitter.emit(secondVal)
    expect(current).toEqual(secondVal)
  })

  it('supports multiple listeners', () => {
    let current1: string | undefined
    let current2: string | undefined
    emitter.subscribe((newVal: string) => {
      current1 = newVal
    })
    emitter.subscribe((newVal: string) => {
      current2 = newVal
    })
    expect(current1).toEqual(defaultVal)
    expect(current2).toEqual(defaultVal)

    const secondVal = 'second'
    emitter.emit(secondVal)
    expect(current1).toEqual(secondVal)
    expect(current2).toEqual(secondVal)
  })

  it('stops updating a listener after `unsubscribe` is called', () => {
    let current1: string | undefined
    let current2: string | undefined

    const secondListener = (newVal: string): void => {
      current2 = newVal
    }
    emitter.subscribe((newVal: string) => {
      current1 = newVal
    })
    emitter.subscribe(secondListener)
    expect(current1).toEqual(defaultVal)
    expect(current2).toEqual(defaultVal)

    const secondVal = 'second'
    emitter.emit(secondVal)
    expect(current1).toEqual(secondVal)
    expect(current2).toEqual(secondVal)

    emitter.unsubscribe(secondListener)
    const thirdVal = 'third'
    emitter.emit(thirdVal)
    expect(current1).toEqual(thirdVal)
    expect(current2).toEqual(secondVal)
  })
})
