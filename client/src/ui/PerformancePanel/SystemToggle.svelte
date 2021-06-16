<script>
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import { Relm } from "~/stores/Relm";
import { onMount } from "svelte";

  export let name;

  let enabled = true;

  $: {
    const system = $Relm.world.systems.getByName(name);
    if (system) system.active = enabled;
  }

  onMount(() => {
    const interval = setInterval(() => {
      const system = $Relm.world.systems.getByName(name)
      if (system) enabled = system.active;
    }, 50)
    return () => {
      clearInterval(interval)
    }
  })
</script>

<div><lbl>Enabled:</lbl><ToggleSwitch bind:enabled /></div>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px 4px;
  }
  lbl {
    margin-right: 8px;
  }
</style>
