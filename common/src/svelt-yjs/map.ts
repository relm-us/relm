import type * as Y from "yjs"

// import { writable } from "svelte/store";

import type { Readable, Subscriber, Unsubscriber } from "./Readable.js"

export type YReadableMap<T> = Readable<Map<string, T>> & { y: Y.Map<T> }

export function readableMap<T>(map: Y.Map<T>): YReadableMap<T> {
  const init: T = map.toJSON()

  let value: Map<string, T> = new Map<string, T>(Object.entries(init))

  let subs = []

  const setValue = (newValue: Map<string, T>) => {
    // update stored value so new subscribers can get the initial value
    value = newValue

    // call all handlers to notify of new value
    for (const sub of subs) {
      sub(value)
    }
  }

  const observer = (event: Y.YMapEvent<T>, _transaction) => {
    const target = event.target as Y.Map<T>
    setValue(new Map(Object.entries(target.toJSON())))
  }

  value = new Map(Object.entries(map.toJSON()))
  map.observe(observer)

  const subscribe = (handler: Subscriber<Map<string, T>>): Unsubscriber => {
    subs = [...subs, handler]

    // call just this handler once when it first subscribes
    handler(value)

    // return unsubscribe function
    return () => {
      subs = subs.filter((sub) => sub !== handler)
    }
  }

  return { subscribe, y: map }
}
