import MediaDevices, { type DeviceChange, type DeviceInfo } from "media-devices";
import { writable, type Readable } from "svelte/store";

export const mediaDevices: Readable<DeviceInfo[]> = createStore();

function createStore() {
	const { subscribe, set } = writable(null);

	(async () => {
		const devices = await MediaDevices.enumerateDevices();

		set(devices);

		// Listen for changes in available devices
		MediaDevices.ondevicechange = (update) => {
			set(update.devices);
		};
	})();

	return {
		// DeviceList behaves as a Svelte-subscribable store
		subscribe
	};
}
