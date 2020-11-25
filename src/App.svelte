<script lang="ts">
  import WorldContainer from "~/ui/WorldContainer";

  import EditorPanel from "~/ui/EditorPanel";
  import PerformancePanel from "~/ui/PerformancePanel";
  import Input from "~/input";

  import Button from "~/ui/Button";

  import GroupUngroupButton from "~/ui/GroupUngroupButton";
  import ActionButton from "~/ui/ActionButton";
  import PausePlayButton from "~/ui/PausePlayButton";
  import StepFrameButton from "~/ui/StepFrameButton";
  import ConnectButton from "~/ui/ConnectButton";

  import { world } from "~/stores/world";

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
  button-panel-left {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 2;
  }
  button-panel-left.open {
    left: 300px;
  }
  button-panel-right {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 2;
  }
</style>

<!-- The virtual world! -->
{#if $world}
  <WorldContainer />

  {#if visible.perf}
    <PerformancePanel />
  {/if}

  {#if visible.editor}
    <EditorPanel />
  {/if}

  <!-- Keyboard, Mouse input -->
  <Input world={$world} />
{/if}

<button-panel-left class:open={visible.perf || visible.editor}>
  <Button on:click={() => togglePanel('editor')}>Editor</Button>
  <Button on:click={() => togglePanel('perf')}>Performance</Button>
</button-panel-left>

<button-panel-right>
  <GroupUngroupButton />
  <ActionButton />
  <PausePlayButton />
  <StepFrameButton />
  <ConnectButton />
</button-panel-right>
