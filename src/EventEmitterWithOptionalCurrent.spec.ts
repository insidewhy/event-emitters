import { EventEmitterWithOptionalCurrent } from './EventEmitterWithOptionalCurrent'

describe('EventEmitterWithOptionalCurrent', () => {
  it('sends current status when it was provided and listener first subscribes', () => {
    let current = 42
    const emitter = new EventEmitterWithOptionalCurrent<number>(1)
    emitter.subscribe((newVal: number) => {
      current = newVal
    })
    expect(current).toEqual(1)
  })

  it('does not send any status when listener subscribes when no current value was provided', () => {
    let current = 42
    const emitter = new EventEmitterWithOptionalCurrent<number>()
    emitter.subscribe((newVal: number) => {
      current = newVal
    })
    expect(current).toEqual(42)
  })

  it('updates subscribed listener with statuses as they change', () => {
    let current = 42
    const emitter = new EventEmitterWithOptionalCurrent<number>()
    emitter.subscribe((newVal: number) => {
      current = newVal
    })
    expect(current).toEqual(42)

    const firstVal = 1
    emitter.emit(firstVal)
    expect(current).toEqual(firstVal)

    let otherValue = 43
    emitter.subscribe((newVal: number) => {
      otherValue = newVal
    })
    expect(otherValue).toEqual(1)
  })
})
