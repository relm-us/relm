<script lang="ts">
import ObjectSelectButton from "./1.svelte"
import PanRotateCameraButton from "./2.svelte"
import GroupUngroupButton from "./3.svelte"
</script>

<r-toolbar>
  <ObjectSelectButton />

  <PanRotateCameraButton />

  <GroupUngroupButton />
</r-toolbar>

<style>
  r-toolbar {
    display: flex;
    padding: 7px 6px;
    background: var(--background-transparent-gray);
    border-radius: 4px;
    height: min-content;

    /* Custom CSS for buttons within Toolbar */
    --margin: 2px;
    --padv: 6px;
    --padh: 6px;
    --top-radius: 2px;
    --right-radius: 2px;
    --bottom-radius: 2px;
    --left-radius: 2px;

    --bg-hover-color: var(--foreground-gray, gray);
    --bg-color: var(--foreground-white, white);
    --fg-color: var(--background-gray, black);
  }
</style>
