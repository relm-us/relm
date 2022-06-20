<script type="ts">
  import Viewport from "~/ui/Viewport";
  import Overlay from "~/ui/Overlay";
  import Input from "~/events/input/Input.svelte";
  import { getNotificationsContext } from "svelte-notifications";

  const notifyContext = getNotificationsContext();

  import { onMount } from "svelte/internal";

  export let ecsWorld;
  export let dispatch;
  export let permits;
  export let state;

  $$props;

  onMount(() => {
    // A bit of a hack; share the notification context globally so that non-svelte
    // code can show notifications
    dispatch({ id: "gotNotificationContext", notifyContext });
  });
</script>

<Viewport {ecsWorld} />

<Overlay {dispatch} {permits} {state} />

<!-- Keyboard, Mouse input -->
<Input world={ecsWorld} {permits} />
