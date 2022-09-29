<script lang="ts">
  import type { State } from "~/main/ProgramTypes";

  // Debug UI
  import DebugPane from "~/ui/Debug/DebugPane";

  import CenterCamera from "~/ui/CenterCamera";
  import Toolbar from "~/ui/Build/Toolbar";
  import BuildPanel from "~/ui/Build/BuildPanel";

  import { worldUIMode } from "~/stores";
  import { debugMode } from "~/stores/debugMode";
  import { centerCameraVisible } from "~/stores/centerCameraVisible";
  import { showCenterButtons } from "~/stores/showCenterButtons";
  import { permits } from "~/stores/permits";

  import CenterButtons from "./CenterButtons.svelte";
  import DialogStack from "./DialogStack.svelte";
  import PauseAutomatically from "./PauseAutomatically.svelte";

  export let dispatch; // Program dispatch
  export let state: State;

  let buildMode = false;
  $: buildMode = $permits.includes("edit") && $worldUIMode === "build";
</script>

<!-- Pause game if participant is not focused on window, to save CPU/GPU resources -->
<PauseAutomatically />

<DialogStack />

{#if $centerCameraVisible}
  <CenterCamera />
{/if}

<overlay class:open={buildMode}>
  <overlay-panel class="interactive">
    {#if buildMode}
      <BuildPanel />
    {/if}
  </overlay-panel>

  <overlay-content>
    <r-toolbar-wrapper>
      {#if $debugMode}
        <DebugPane {state} />
      {/if}
      {#if buildMode}
        <Toolbar />
      {/if}
    </r-toolbar-wrapper>
  </overlay-content>
</overlay>

{#if $showCenterButtons}
  <CenterButtons {dispatch} />
{/if}

<style>
  overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 3;

    pointer-events: none;

    display: flex;
    flex-direction: row-reverse;
    flex-wrap: nowrap;
  }
  @media screen and (max-width: 480px) {
    overlay {
      display: none;
    }
  }
  overlay :global(button) {
    pointer-events: all;
  }
  overlay-panel {
    display: flex;
    height: 100%;
    width: 0px;
  }
  overlay.open overlay-panel {
    width: 300px !important;
  }
  overlay-content {
    display: flex;
  }

  r-toolbar-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    height: min-content;
  }

  r-toolbar-wrapper > :global(*) {
    margin-top: 2px;
    margin-right: 2px;
  }
</style>
