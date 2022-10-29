import { derived } from "svelte/store";

import { audioActivity } from "../audioActivity";
import { localStream } from "./localStream";

export const localAudioLevel = derived(
	[localStream],
	([$stream], set) => {
		let activity;
		if ($stream && $stream.getAudioTracks().length) {
			activity = audioActivity($stream, set);
		}

		return () => {
			if (activity) activity.destroy();
		};
	},
	0
);
