<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import IoMdLogIn from 'svelte-icons/io/IoMdLogIn.svelte'
  import SignInWindow from "./SignInWindow.svelte";

  export let enabled = false;

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
    <SignInWindow bind:enabled />
  {/if}
</div>

<style>

</style>
