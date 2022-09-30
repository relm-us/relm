<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import IoIosBuild from "svelte-icons/io/IoIosBuild.svelte";
  import { globalEvents } from "~/events";
</script>

<CircleButton
  on:click={() => globalEvents.emit("switch-mode")}
  padding={0}
  Icon={IoIosBuild}
/>
