<script lang="ts">
  import WorldContainer from "~/ui/WorldContainer";

  import EditorPanel from "~/ui/EditorPanel";
  import PerformancePanel from "~/ui/PerformancePanel";
  import Input from "~/input";

  import Button from "~/ui/Button";
  import PausePlayButton from "~/ui/PausePlayButton";
  import GroupUngroupButton from "~/ui/GroupUngroupButton";
  import ActionButton from "~/ui/ActionButton";

  import { store as world } from "./world/store";

  let visible = {
    perf: false,
    editor: false,
  };

  function togglePanel(panelName) {
    const currentState = visible[panelName];

    // Can't have more than one panel open at a time
    for (const key in visible) visible[key] = false;

    visible[panelName] = !currentState;
  }
</script>

<style>
  button-panel {
    display: flex;
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 2;
  }
</style>

<!-- The virtual world! -->
{#if $world}
  <WorldContainer world={$world} />

  {#if visible.perf}
    <PerformancePanel />
  {/if}

  {#if visible.editor}
    <EditorPanel world={$world} />
  {/if}

  <!-- Keyboard, Mouse input -->
  <Input world={$world} />
{/if}

<button-panel>
  <Button on:click={() => togglePanel('editor')}>Editor</Button>
  <Button on:click={() => togglePanel('perf')}>Performance</Button>
  <GroupUngroupButton />
  <ActionButton />
  <PausePlayButton />
</button-panel>
