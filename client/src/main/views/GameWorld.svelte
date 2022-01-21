<script type="ts">
  import Viewport from "~/ui/Viewport";
  import Overlay from "~/ui/Overlay";
  import Input from "~/events/input/Input.svelte";

  import BlankWithLogo from "./BlankWithLogo.svelte";

  export let ecsWorld;
  export let dispatch;
  export let permits;
  export let overlayScreen;
  export let state

  $$props;
</script>

<Viewport {ecsWorld} />

<Overlay {dispatch} {permits} {state} />

<!-- Keyboard, Mouse input -->
<Input world={ecsWorld} {permits} />

{#if overlayScreen}
  <BlankWithLogo />
{/if}
