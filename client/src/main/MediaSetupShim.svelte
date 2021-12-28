<script lang="ts">
  import MediaSetup from "~/ui/MediaSetup";
  import type { Dispatch } from "./RelmStateAndMessage";

  export let dispatch: Dispatch;

  function done() {
    dispatch({ id: "configuredMedia" });
  }
</script>

<MediaSetup on:done={done} />
