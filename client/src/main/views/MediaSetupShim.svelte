<script lang="ts">
  import MediaSetup from "~/ui/MediaSetup";
  import type { Dispatch } from "../ProgramTypes";
  import type { DeviceIds } from "video-mirror";

  export let dispatch: Dispatch;

  export let audioDesired = true;
  export let videoDesired = true;
  export let preferredDeviceIds: DeviceIds;

  function done({ detail }) {
    dispatch({ id: "didSetUpAudioVideo", state: detail });
  }
</script>

<MediaSetup on:done={done} {audioDesired} {videoDesired} {preferredDeviceIds} />
