export interface EventSink<T> {
  emit(newMessage: T): void
}
