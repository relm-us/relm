<script lang="ts">
  import IoMdExit from "svelte-icons/io/IoMdExit.svelte";

  import { worldManager } from "~/world";

  import CircleButton from "~/ui/lib/CircleButton";

  function onClick() {
    worldManager.logins.logout();
  }
</script>

<div>
  <CircleButton on:click={onClick} Icon={IoMdExit} />
</div>
