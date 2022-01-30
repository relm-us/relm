import { writable, get, Writable } from "svelte/store";

declare type Updater<T> = (value: T) => T;
declare type StoreDict<T> = { [key: string]: Writable<T> };

const stores: StoreDict<any> = {};

function parse<T>(json: string, fallbackValue: T, key: string) {
  let value: T;
  try {
    value = JSON.parse(json);
  } catch (err) {
    console.log(`unable to parse localStorage value at key '${key}'`, err);
    console.trace(json);
    value = fallbackValue;
  }
  return value;
}

export function storedWritable<T>(key: string, initialValue: T): Writable<T> {
  const browser = typeof localStorage != "undefined";

  function updateStorage(key: string, value: T) {
    if (!browser) return;

    localStorage.setItem(key, JSON.stringify(value));
  }

  if (!stores[key]) {
    const store = writable(initialValue, (set) => {
      const json = browser ? localStorage.getItem(key) : null;

      if (json) {
        set(parse(json, initialValue, key));
      }

      if (browser) {
        const handleStorage = (event: StorageEvent) => {
          if (event.key === key)
            set(
              event.newValue ? parse(event.newValue, initialValue, key) : null
            );
        };

        window.addEventListener("storage", handleStorage);

        return () => window.removeEventListener("storage", handleStorage);
      }
    });

    const { subscribe, set } = store;

    stores[key] = {
      set(value: T) {
        updateStorage(key, value);
        set(value);
      },
      update(updater: Updater<T>) {
        const value = updater(get(store));

        updateStorage(key, value);
        set(value);
      },
      subscribe,
    };
  }

  return stores[key];
}
