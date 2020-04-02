import { EventEmitterWithCurrent, QueueingEventEmitter } from '.'

describe('EventEmitterWithCurrent', () => {
  /* eslint-disable @typescript-eslint/explicit-function-return-type */

  const defaultVal = 'first'
  const createEventEmitter = () => new EventEmitterWithCurrent<string>(defaultVal)

  let emitter = createEventEmitter()

  beforeEach(() => {
    emitter = createEventEmitter()
  })

  it('sends current status when listener first subscribes', () => {
    let current = ''
    emitter.subscribe((newVal: string) => {
      current = newVal
    })
    expect(current).toEqual(defaultVal)
  })

  it('updates subscribed listener with statuses as they change', () => {
    let current = ''
    emitter.subscribe((newVal: string) => {
      current = newVal
    })

    const secondVal = 'second'
    emitter.emit(secondVal)
    expect(current).toEqual(secondVal)
  })

  it('supports multiple listeners', () => {
    let current1 = ''
    let current2 = ''
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
    let current1 = ''
    let current2 = ''

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
})

describe('QueueingEventEmitter', () => {
  const createEventEmitter = () => new QueueingEventEmitter<string>()

  let emitter = createEventEmitter()

  beforeEach(() => {
    emitter = createEventEmitter()
  })

  it('queues messages when there are no subscribers and emits them to first subscriber', () => {
    const subscriber = jest.fn()

    emitter.emit('one')
    emitter.emit('two')

    emitter.subscribe(subscriber)
    expect(subscriber.mock.calls).toEqual([['one'], ['two']])
  })

  it('stops queueing messages when there is a subscriber', () => {
    const subscriber = jest.fn()

    emitter.emit('one')
    emitter.emit('two')

    emitter.subscribe(subscriber)
    expect(subscriber.mock.calls).toEqual([['one'], ['two']])

    emitter.emit('three')
    expect(subscriber.mock.calls).toEqual([['one'], ['two'], ['three']])
  })

  it('resumes queueing message when it loses all subscribers', () => {
    const subscriber1 = jest.fn()
    const subscriber2 = jest.fn()

    emitter.emit('one')
    emitter.emit('two')

    emitter.subscribe(subscriber1)
    emitter.subscribe(subscriber2)
    expect(subscriber1.mock.calls).toEqual([['one'], ['two']])
    expect(subscriber2).toHaveBeenCalledTimes(0)

    emitter.emit('three')
    expect(subscriber1.mock.calls).toEqual([['one'], ['two'], ['three']])
    expect(subscriber2.mock.calls).toEqual([['three']])

    emitter.unsubscribe(subscriber1)
    emitter.emit('four')
    expect(subscriber1).toHaveBeenCalledTimes(3)
    expect(subscriber2.mock.calls).toEqual([['three'], ['four']])

    emitter.unsubscribe(subscriber2)
    emitter.emit('five')
    emitter.emit('six')
    const subscriber3 = jest.fn()
    emitter.subscribe(subscriber3)
    expect(subscriber3.mock.calls).toEqual([['five'], ['six']])
    emitter.emit('seven')
    expect(subscriber3.mock.calls).toEqual([['five'], ['six'], ['seven']])
  })

  it('re-throws the final error when the subscriber throws during queue drain', () => {
    const subscriber1 = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('1')
      })
      .mockImplementationOnce(() => {
        throw new Error('2')
      })

    emitter.emit('one')
    emitter.emit('two')
    emitter.emit('three')

    expect(() => {
      emitter.subscribe(subscriber1)
    }).toThrow('2')

    // make sure the queue is drained
    const subscriber2 = jest.fn()
    emitter.subscribe(subscriber2)
    expect(subscriber2).toHaveBeenCalledTimes(0)
  })
})
