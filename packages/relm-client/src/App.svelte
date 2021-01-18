<script lang="ts">
  import WorldContainer from "~/ui/WorldContainer";

  import LibraryPanel from "~/ui/LibraryPanel";
  import EditorPanel from "~/ui/EditorPanel";
  import PerformancePanel from "~/ui/PerformancePanel";

  import Input from "~/input";
  import Button from "~/ui/Button";

  import BuildPlayModeButton from "~/ui/BuildPlayModeButton";
  import GroupUngroupButton from "~/ui/GroupUngroupButton";
  import PausePlayButton from "~/ui/PausePlayButton";
  import StepFrameButton from "~/ui/StepFrameButton";
  import UploadButton from "~/ui/UploadButton";
  import ConnectButton from "~/ui/ConnectButton";
  import ResetWorldButton from "~/ui/ResetWorldButton";

  import { world } from "~/stores/world";
  import { mode } from "~/stores/mode";

  type PanelType = "library" | "editor" | "performance";

  let openPanel: PanelType = "library";

  const playMode = () => {
    $mode = "play";
  };
</script>

<style>
  play-buttons {
    display: flex;
    justify-content: left;
    margin-bottom: 4px;
    --margin: 2px;
  }

  overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 2;

    pointer-events: none;

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
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
    /* display: flex; */
    height: 100%;
    width: 0px;
  }
  overlay.open overlay-panel {
    width: 300px !important;
  }
  overlay-left {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    margin-left: 50px;
  }
  overlay-center {
    display: flex;
    flex-direction: row;
    z-index: 1;
  }
  overlay-right {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
  }
  overlay-content {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
  }
  panel-tabs {
    display: flex;
    --margin: 0px;

    position: absolute;
    min-width: 500px;
    top: -20px;
    left: 300px;
    transform: translate(-50%) rotate(90deg) translate(50%, -50%);
  }
</style>

<!-- The virtual world! -->
{#if $world}
  <WorldContainer />

  <!-- Keyboard, Mouse input -->
  <Input world={$world} />
{/if}

<overlay class:open={$mode === 'build'}>
  <overlay-panel>
    {#if $mode === 'build'}
      {#if openPanel === 'library'}
        <LibraryPanel on:minimize={playMode} />
      {/if}

      {#if openPanel === 'performance'}
        <PerformancePanel on:minimize={playMode} />
      {/if}

      {#if openPanel === 'editor'}
        <EditorPanel on:minimize={playMode} />
      {/if}
      <panel-tabs>
        <Button
          active={openPanel === 'library'}
          on:click={() => (openPanel = 'library')}>
          Collections
        </Button>
        <Button
          active={openPanel === 'editor'}
          on:click={() => (openPanel = 'editor')}>
          Entity Editor
        </Button>
        <Button
          active={openPanel === 'performance'}
          on:click={() => (openPanel = 'performance')}>
          Performance
        </Button>
      </panel-tabs>
    {/if}
  </overlay-panel>

  <overlay-content>
    <overlay-left>
      <play-buttons>
        <PausePlayButton />
        <StepFrameButton />
        <UploadButton />
      </play-buttons>
      {#if $mode === 'build'}
        <GroupUngroupButton />
        <ResetWorldButton />
      {/if}
    </overlay-left>

    <overlay-center>
      <BuildPlayModeButton />
    </overlay-center>

    <overlay-right>
      <!-- <ActionButton /> -->
      <ConnectButton />
    </overlay-right>
  </overlay-content>
</overlay>
