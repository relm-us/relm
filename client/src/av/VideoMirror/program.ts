export type State = {
	shake?: Function;
	stream?: MediaStream;
	videoDesired: boolean;
	audioDesired: boolean;
	preferredDeviceIds: DeviceIds;
	videoConstraints: MediaTrackConstraints;
	audioConstraints: MediaTrackConstraints;
	permissionBlocked: boolean;
	permissionWouldBeGranted: boolean;
};
export type Message =
	| { id: 'getUserMedia'; shake?: Function }
	| { id: 'gotUserMedia'; stream: MediaStream }
	| { id: 'userMediaBlocked' }
	| {
			id: 'toggle';
			property: 'audioDesired' | 'videoDesired' | 'permissionBlocked' | 'permissionWouldBeGranted';
	  }
	| {
			id: 'selectDevice';
			kind: 'audioinput' | 'audiooutput' | 'videoinput';
			deviceId: string;
	  }
	| { id: 'done' };

export type Dispatch = (message: Message) => void;
export type Effect = (dispatch: Dispatch) => void;
export type Program = {
	init: [State, Effect?];
	update: (msg: Message, state: State) => [State, Effect?];
	view: (state: State, dispatch: Dispatch) => void;
};

export type DeviceIds = {
	videoinput: string | null;
	audioinput: string | null;
	audiooutput: string | null;
};
