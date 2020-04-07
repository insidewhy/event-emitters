# event-emitters

[![build status](https://circleci.com/gh/insidewhy/event-emitters.png?style=shield)](https://circleci.com/gh/insidewhy/event-emitters)
[![Known Vulnerabilities](https://snyk.io/test/github/insidewhy/event-emitters/badge.svg)](https://snyk.io/test/github/insidewhy/event-emitters)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)

Typesafe event emitters.

## EventEmitter&lt;T&gt;

The same as node's EventEmitter but:

- Only emits a single event of type `T`.
- Throw an exception when a client registers the same listener more than once.
- Throw an exception when a client tries to remove a listener that is not listening.

## EventEmitterWithCurrent&lt;T&gt;

This is the same as EventEmitter but:

- Is initialized with the current message.
- Emits the current message to each listener as soon as it subscribes.

## QueueingEventEmitter&lt;T&gt;

This is the same as EventEmitter but:

- Queues messages when there are no subscribers.
- Delivers queued message to the first subscriber, then drains the queue.
