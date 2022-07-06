<script>
  import Button from "~/ui/lib/Button";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";
  import { worldManager } from "~/world";

  export let enabled;

  function onClick() {
    worldManager.logout();
    enabled = false;
  }

</script>

<Fullwindow>
  <r-window>
    <div>
      <Button on:click={onClick}>Test</Button>
      <Button>Logout</Button>
    </div>
  </r-window>
</Fullwindow>

<style>
  r-window {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  div {
    width: 50%;
    height: 50%;
    background-color: white;
  }
</style>