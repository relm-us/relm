<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import SettingsIcon from "svelte-icons/io/IoMdSettings.svelte";
  import type { Dispatch } from "main/ProgramTypes";

  export let dispatch: Dispatch;

  const onClick = () => {
    dispatch({ id: "setUpAudioVideo" });
  };
</script>

<CircleButton on:click={onClick}>
  <icon>
    <SettingsIcon />
  </icon>
  <slot />
</CircleButton>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
</style>
