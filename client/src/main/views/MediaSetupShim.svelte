<script lang="ts">
  import MediaSetup from "~/ui/MediaSetup";
  import type { Dispatch } from "../ProgramTypes";
  import type { DeviceIds } from "video-mirror";

  export let dispatch: Dispatch;

  export let audioDesired;
  export let videoDesired;
  export let preferredDeviceIds: DeviceIds;

  let didDispatch = false;

  function done({ detail }) {
    if (didDispatch) return;

    didDispatch = true;

    if (detail) {
      dispatch({
        id: "didSetUpAudioVideo",
        audioDesired: detail.audioDesired,
        videoDesired: detail.videoDesired,
        preferredDeviceIds: detail.preferredDeviceIds,
      });
    } else {
      dispatch({
        id: "didSetUpAudioVideo",
        audioDesired: false,
        videoDesired: false,
      });
    }
  }
</script>

<MediaSetup on:done={done} {audioDesired} {videoDesired} {preferredDeviceIds} />
