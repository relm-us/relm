<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import { get } from "svelte/store";

  import { localStream } from "./stores/localStream";
  import { mediaDevices } from "./stores";

  import type { Program, Dispatch, DeviceIds, State, Effect } from "./program";
  import { getUserMedia } from "./commands/getUserMedia";
  import { logEnabled } from "./logEnabled";

  import ProgramView from "./ProgramView.svelte";
  import Setup from "./Setup.svelte";
  import { localAudioDeviceId } from "./stores/localAudioDeviceId";
  import { localVideoDeviceId } from "./stores/localVideoDeviceId";

  export let videoDesired = true;
  export let audioDesired = true;
  export let autoFocus = false;

  export let preferredDeviceIds: DeviceIds = {
    audioinput: null,
    audiooutput: null,
    videoinput: null,
  };

  export let videoConstraints: MediaTrackConstraints = {
    facingMode: "user",
  };
  export let audioConstraints: MediaTrackConstraints = {
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true,
    channelCount: 2,
    sampleRate: 48000,
    sampleSize: 16,
  };

  const dispatchSvelte = createEventDispatcher();

  $: if (logEnabled)
    console.log("VideoMirror preferredDeviceIds", preferredDeviceIds);

  let streamToClose: MediaStream;

  function closeMedia() {
    if (streamToClose) {
      if (logEnabled) console.log("VideoMirror#closeMedia: stopping tracks");

      streamToClose.getTracks().forEach((t) => t.stop());
    } else {
      if (logEnabled) console.log("VideoMirror#closeMedia: noop");
    }
  }

  onDestroy(closeMedia);

  // Create a single effect from a list of effects
  function batch(commands) {
    return function (dispatch: Dispatch) {
      for (var i = 0; i < commands.length; i++) {
        const effect = commands[i];
        effect(dispatch);
      }
    };
  }

  function setConstraintsFromDeviceIds(state: State) {
    if (
      state.preferredDeviceIds.audioinput &&
      get(mediaDevices).find(
        (device) => device.deviceId === state.preferredDeviceIds.audioinput
      )
    ) {
      state.audioConstraints.deviceId = state.preferredDeviceIds.audioinput;
    } else {
      delete state.audioConstraints.deviceId;
    }
    if (
      state.preferredDeviceIds.videoinput &&
      get(mediaDevices).find(
        (device) => device.deviceId === state.preferredDeviceIds.videoinput
      )
    ) {
      state.videoConstraints.deviceId = state.preferredDeviceIds.videoinput;
    } else {
      delete state.videoConstraints.deviceId;
    }
    if (logEnabled) {
      console.log(
        "VideoMirror setConstraintsFromDeviceIds",
        state.audioConstraints.deviceId,
        state.videoConstraints.deviceId
      );
    }
  }

  const storedGrantedKey = "video-mirror.granted";

  function createApp(props): Program {
    const permissionWouldBeGranted =
      localStorage.getItem(storedGrantedKey) === "true";

    const initialEffects: Effect[] = [];

    if (permissionWouldBeGranted) {
      initialEffects.push(
        getUserMedia({ audio: audioConstraints, video: videoConstraints })
      );
    }

    const initialState = {
      stream: get(localStream),
      videoDesired,
      audioDesired,
      preferredDeviceIds,
      videoConstraints,
      audioConstraints,
      permissionBlocked: false,
      permissionWouldBeGranted,
    };

    return {
      init: [initialState, batch(initialEffects)],
      update(msg, state) {
        if (msg.id === "getUserMedia") {
          setConstraintsFromDeviceIds(state);
          return [
            { ...state, shake: msg.shake },
            getUserMedia({ audio: audioConstraints, video: videoConstraints }),
          ];
        } else if (msg.id === "gotUserMedia") {
          // We need to remember this stream to close it, in case of failure
          // a desire for no audio/video
          streamToClose = msg.stream;

          localAudioDeviceId.set(
            msg.stream.getAudioTracks()[0]?.getSettings().deviceId
          );
          localVideoDeviceId.set(
            msg.stream.getVideoTracks()[0]?.getSettings().deviceId
          );

          return [
            { ...state, stream: msg.stream, permissionBlocked: false },
            (dispatch) => {
              localStorage.setItem(storedGrantedKey, "true");
            },
          ];
        } else if (msg.id === "userMediaBlocked") {
          const effects = [
            // If we are blocked this time, don't try to automatically get permission next time
            (dispatch) => localStorage.setItem(storedGrantedKey, "false"),
          ];
          // If this is the 2nd+ time we've been blocked, shake the red/blank video rectangle
          if (state.permissionBlocked && state.shake)
            effects.push((dispatch) => state.shake());
          return [
            { ...state, stream: null, permissionBlocked: true },
            batch(effects),
          ];
        } else if (msg.id === "selectDevice") {
          const newState = { ...state };
          newState.preferredDeviceIds[msg.kind] = msg.deviceId;
          setConstraintsFromDeviceIds(newState);

          return [
            newState,
            getUserMedia({
              audio: newState.audioConstraints,
              video: newState.videoConstraints,
            }),
          ];
        } else if (msg.id === "toggle") {
          return [{ ...state, [msg.property]: !state[msg.property] }];
        } else if (msg.id === "done") {
          if (state.audioDesired || state.videoDesired) {
            streamToClose = null;

            // Finally, we've succeeded, so pass the stream on as a global svelte store
            $localStream = state.stream;

            if (logEnabled) {
              console.log("Setting localStream", {
                ...state,
                localStreamTracks: state.stream.getTracks(),
              });
            }
          } else {
            state.stream = null;
          }

          if (state.stream?.getVideoTracks().length === 0) {
            state.videoDesired = false;
          }

          // Let parent component know we're done
          dispatchSvelte("done", state);
          return [state];
        } else {
          return [state];
        }
      },
      view(state, dispatch) {
        return [
          Setup,
          {
            autoFocus,
            stream: state.stream,
            audioDesired: state.audioDesired,
            videoDesired:
              state.videoDesired &&
              (!state.stream || state.stream.getVideoTracks().length > 0),
            preferredDeviceIds: state.preferredDeviceIds,
            permissionBlocked: state.permissionBlocked,
            toggleAudioDesired: () =>
              dispatch({ id: "toggle", property: "audioDesired" }),
            toggleVideoDesired: () =>
              dispatch({ id: "toggle", property: "videoDesired" }),
            handleRequestPermission: (shake) =>
              dispatch({ id: "getUserMedia", shake }),
            handleDeviceSelected: ({ detail }) => {
              dispatch({
                id: "selectDevice",
                kind: detail.kind,
                deviceId: detail.value,
              });
            },
            handleDone: () => dispatch({ id: "done" }),
          },
        ];
      },
    };
  }
</script>

<ProgramView {createApp} />
