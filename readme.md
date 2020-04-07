# event-emitters

[![build status](https://circleci.com/gh/insidewhy/event-emitters.png?style=shield)](https://circleci.com/gh/insidewhy/event-emitters)
[![Known Vulnerabilities](https://snyk.io/test/github/insidewhy/event-emitters/badge.svg)](https://snyk.io/test/github/insidewhy/event-emitters)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)

Typesafe event emitters.

## EventEmitter&lt;T&gt;

Similar to node's EventEmitter but:

- Only emits a single event of type `T`.
- Throw an exception when a client registers the same listener more than once.
- Throw an exception when a client tries to remove a listener that is not listening.

```typescript
const emitter = new EventEmitter<number>()
const listener = (n: number): void => {
  console.log(n)
}

emitter.subscribe(listener)
emitter.emit(42)

try {
  emitter.subscribe(listener)
} catch (e) {
  console.log('same listener')
}

emitter.unsubscribe(listener)
try {
  emitter.unsubscribe(() => {})
} catch (e) {
  console.log('listener not found')
}
```

The above will log:

```
42
same listener
listener not found
```

## EventEmitterWithCurrent&lt;T&gt;

Provides the same API as EventEmitter but:

- Is initialized with the current message.
- Emits the current message to each listener as soon as it subscribes.

```typescript
const emitter = new EventEmitterWithCurrent<number>(42)
emitter.subscribe((n: number): void => {
  console.log(n)
})
emitter.emit(43)
```

The above will log:

```
42
43
```

## QueueingEventEmitter&lt;T&gt;

Provides the same API as EventEmitter but:

- Queues messages when there are no subscribers.
- Delivers queued message to the first subscriber, then drains the queue.

```typescript
const emitter = new EventEmitterWithCurrent<number>(42)
emitter.emit(44)
emitter.emit(45)
emitter.subscribe((n: number): void => {
  console.log(n)
})
emitter.emit(46)
```

The above will log:

```
44
45
46
```
