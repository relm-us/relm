<script type="ts">
  import Viewport from "~/ui/Viewport";
  import Overlay from "~/ui/Overlay";
  import Input from "~/input";

  export let ecsWorld;
  export let dispatch;
  export let buildModeAllowed = false;

  $$props;
</script>

<Viewport {ecsWorld} />

<Overlay {dispatch} {buildModeAllowed} />

<!-- Keyboard, Mouse input -->
<Input world={ecsWorld} />
