<script lang="ts">
  import { fly } from "svelte/transition";

  import Button from "~/ui/lib/Button";

  import { globalEvents } from "~/events";
  import { openPanel } from "~/stores";

  import PerformancePanel from "~/ui/Debug/PerformancePanel";

  import AddPanel from "../AddPanel";
  import ModifyPanel from "../ModifyPanel";
  import ActionsPanel from "../ActionsPanel";
  import SettingsPanel from "../SettingsPanel";
  import ExportPanel from "../ExportPanel";

  function toPlayMode() {
    globalEvents.emit("switch-mode", "play");
  }
</script>

<panel-tabs in:fly={{ y: -260 }}>
  <Button
    active={$openPanel === "add"}
    depress={false}
    on:click={() => ($openPanel = "add")}>Add</Button
  >
  <Button
    active={$openPanel === "modify"}
    depress={false}
    on:click={() => ($openPanel = "modify")}>Modify</Button
  >
  <Button
    active={$openPanel === "actions"}
    depress={false}
    on:click={() => ($openPanel = "actions")}>Actions</Button
  >
  <Button
    active={$openPanel === "settings"}
    depress={false}
    on:click={() => ($openPanel = "settings")}>Settings</Button
  >
</panel-tabs>

<div in:fly={{ x: 260 }} style="display:flex;width:260px">
  {#if $openPanel === "add"}
    <AddPanel on:minimize={toPlayMode} />
  {/if}

  {#if $openPanel === "modify"}
    <ModifyPanel on:minimize={toPlayMode} />
  {/if}

  {#if $openPanel === "actions"}
    <ActionsPanel on:minimize={toPlayMode} />
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
  }
</style>
