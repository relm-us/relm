import { writable, type Readable } from "svelte/store";

export const mediaDevices: Readable<MediaDeviceInfo[]> = createStore();

function createStore() {
  const { subscribe, set } = writable(null);

  (async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    console.log({ devices })

    set(devices);

    // Listen for changes in available devices
    navigator.mediaDevices.addEventListener('devicechange', async () => {
      const devices = await navigator.mediaDevices.enumerateDevices()
      set(devices);
    })
  })();

  return {
    // DeviceList behaves as a Svelte-subscribable store
    subscribe
  };
}
