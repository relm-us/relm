<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import IoMdLogIn from "svelte-icons/io/IoMdLogIn.svelte";
  import { worldManager } from "~/world";

  async function logout() {
    await worldManager.logout();
  }
</script>

<div>
  <CircleButton
    on:click={logout}
    Icon={IoMdLogIn}
  />
</div>

<style>

</style>
