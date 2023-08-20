<script lang="ts">
  import { fly } from "svelte/transition";

  import Button from "~/ui/lib/Button";

  import { globalEvents } from "~/events/globalEvents";
  import { openPanel } from "~/stores";

  import PerformancePanel from "~/ui/Debug/PerformancePanel";

  import AddPanel from "../AddPanel";
  import ModifyPanel from "../ModifyPanel";
  import LayersPanel from "../LayersPanel";
  import SettingsPanel from "../SettingsPanel";
  import ExportPanel from "../ExportPanel";

  import { _ } from "svelte-i18n";

  function toPlayMode() {
    globalEvents.emit("switch-mode", "play");
  }
</script>

<panel-tabs in:fly={{ y: -260 }}>
  <Button
    active={$openPanel === "add"}
    depress={false}
    on:click={() => ($openPanel = "add")}>{$_("BuildPanel.add")}</Button
  >
  <Button
    active={$openPanel === "modify"}
    depress={false}
    on:click={() => ($openPanel = "modify")}>{$_("BuildPanel.modify")}</Button
  >
  <Button
    active={$openPanel === "layers"}
    depress={false}
    on:click={() => ($openPanel = "layers")}>{$_("BuildPanel.layers")}</Button
  >
  <Button
    active={$openPanel === "settings"}
    depress={false}
    on:click={() => ($openPanel = "settings")}
    >{$_("BuildPanel.settings")}</Button
  >
</panel-tabs>

<div in:fly={{ x: 260 }} style="display:flex;width:260px">
  {#if $openPanel === "add"}
    <AddPanel on:minimize={toPlayMode} />
  {/if}

  {#if $openPanel === "modify"}
    <ModifyPanel on:minimize={toPlayMode} />
  {/if}

  {#if $openPanel === "layers"}
    <LayersPanel on:minimize={toPlayMode} />
  {/if}

  <!-- Export panel opens from button in SettingsPanel -->
  {#if $openPanel === "export"}
    <ExportPanel on:minimize={toPlayMode} />
  {/if}

  <!-- Performance panel opens from button in SettingsPanel -->
  {#if $openPanel === "performance"}
    <PerformancePanel on:minimize={toPlayMode} />
  {/if}

  {#if $openPanel === "settings"}
    <SettingsPanel on:minimize={toPlayMode} />
  {/if}
</div>

<style>
  panel-tabs {
    display: flex;

    height: 40px;
    width: 40px;
    transform: translate(-50%) rotate(90deg) translate(0%, -50%);

    --margin: 0px;
    --top-radius: 0px;

    --bg-hover-color: var(--background-transparent-gray, gray);
    --bg-color: var(--background-transparent-black, black);
  }

  panel-tabs :global(button) {
    color: var(--foreground-white, white);
    margin-right: 1px;
  }
</style>
