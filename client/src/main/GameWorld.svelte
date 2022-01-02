<script type="ts">
  import Viewport from "~/ui/Viewport";
  import Overlay from "~/ui/Overlay";
  import Input from "~/input";

  import BlankWithLogo from "./BlankWithLogo.svelte";

  export let ecsWorld;
  export let dispatch;
  export let permits;
  export let overlayScreen;

  $$props;
</script>

<Viewport {ecsWorld} />

<Overlay {dispatch} {permits} />

<!-- Keyboard, Mouse input -->
<Input world={ecsWorld} {permits} />

{#if overlayScreen}
  <BlankWithLogo />
{/if}
