<script>
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import { worldManager } from "~/world";
  import { onMount } from "svelte";

  import { _ } from "~/i18n";

  export let name;

  let enabled = true;

  $: {
    const system = worldManager.world.systems.getByName(name);
    if (system) system.active = enabled;
  }

  onMount(() => {
    const interval = setInterval(() => {
      const system = worldManager.world.systems.getByName(name)
      if (system) enabled = system.active;
    }, 50)
    return () => {
      clearInterval(interval)
    }
  })
</script>

<div><lbl>{$_("SystemToggle.enabled")}</lbl><ToggleSwitch bind:enabled /></div>

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
