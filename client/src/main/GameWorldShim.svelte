<script type="ts">
  import Viewport from "~/ui/Viewport";
  import Overlay from "~/ui/Overlay";
  import Input from "~/input";

  export let ecsWorld;
  export let dispatch;
  export let permits;

  $$props;
</script>

<Viewport {ecsWorld} />

<Overlay {dispatch} {permits} />

<!-- Keyboard, Mouse input -->
<Input world={ecsWorld} {permits} />
