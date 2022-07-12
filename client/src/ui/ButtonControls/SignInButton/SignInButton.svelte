<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import IoMdLogIn from 'svelte-icons/io/IoMdLogIn.svelte'
  import SignInWindow from "./SignInWindow.svelte";
  import type { Dispatch } from "~/main/ProgramTypes";

  export let enabled = false;
  export let dispatch: Dispatch;

  function toggle() {
    enabled = !enabled;
  }
</script>

<div>
  <CircleButton
    on:click={toggle}
    Icon={IoMdLogIn}
  />
  {#if enabled}
    <SignInWindow bind:enabled {dispatch} />
  {/if}
</div>

<style>

</style>
