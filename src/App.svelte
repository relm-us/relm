<script lang="ts">
  import WorldContainer from "~/ui/WorldContainer";

  import EditorPanel from "~/ui/EditorPanel";
  import PerformancePanel from "~/ui/PerformancePanel";
  import Input from "~/input";

  import Button from "~/ui/Button";

  import BuildPlayModeButton from "~/ui/BuildPlayModeButton";
  import GroupUngroupButton from "~/ui/GroupUngroupButton";
  import ActionButton from "~/ui/ActionButton";
  import PausePlayButton from "~/ui/PausePlayButton";
  import StepFrameButton from "~/ui/StepFrameButton";
  import ConnectButton from "~/ui/ConnectButton";

  import { world } from "~/stores/world";
  import { mode } from "~/stores/mode";

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
  button-panel-top {
    display: flex;
    flex-direction: row;
    position: fixed;
    top: 16px;
    left: 50%;
    z-index: 2;
    transform: translate(-50%);
  }
  play-buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 4px;
  }
</style>

<!-- The virtual world! -->
{#if $world}
  <WorldContainer />

  {#if $mode === 'build'}
    {#if visible.perf}
      <PerformancePanel />
    {/if}

    {#if visible.editor}
      <EditorPanel />
    {/if}
  {/if}

  <!-- Keyboard, Mouse input -->
  <Input world={$world} />
{/if}

{#if $mode === 'build'}
  <button-panel-left class:open={visible.perf || visible.editor}>
    <play-buttons>
      <PausePlayButton />
      <StepFrameButton />
    </play-buttons>
    <Button on:click={() => togglePanel('editor')}>Entity Editor</Button>
    <Button on:click={() => togglePanel('perf')}>Performance</Button>
  </button-panel-left>
{/if}

<button-panel-top>
  <BuildPlayModeButton />
</button-panel-top>

<button-panel-right>
  <GroupUngroupButton />
  <ActionButton />
  <ConnectButton />
</button-panel-right>
