<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import IoMdLogIn from "svelte-icons/io/IoMdLogIn.svelte";
  import { showCenterButtons } from "~/stores/showCenterButtons";

  export let enabled = false;

  function toggle() {
    enabled = !enabled;
    $showCenterButtons = false;
  }
</script>

<div>
  <CircleButton
    on:click={toggle}
    Icon={IoMdLogIn}
  />
</div>

<style>

</style>
