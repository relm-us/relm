<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import IoMdExit from 'svelte-icons/io/IoMdExit.svelte'
  import { worldManager } from "~/world";

  async function logout() {
    await worldManager.logout();
  }
</script>

<div>
  <CircleButton
    on:click={logout}
    Icon={IoMdExit}
  />
</div>

<style>

</style>
