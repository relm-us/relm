<script type="ts">
  import Viewport from "~/ui/Viewport";
  import Overlay from "~/ui/Overlay";
  import Input from "~/events/input/Input.svelte";

  export let ecsWorld;
  export let dispatch;
  export let state;

  $$props;
</script>

<Viewport {ecsWorld} />

<Overlay {dispatch} {state} />

<!-- Keyboard, Mouse input -->
<Input world={ecsWorld} />
