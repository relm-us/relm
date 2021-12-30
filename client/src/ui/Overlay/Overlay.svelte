<script lang="ts">
  import CollectionsPanel from "~/ui/CollectionsPanel";
  import EditorPanel from "~/ui/EditorPanel";
  import ExportPanel from "~/ui/ExportPanel";
  import SettingsPanel from "~/ui/SettingsPanel";
  import PerformancePanel from "~/ui/PerformancePanel";

  import Button from "~/ui/lib/Button";

  import UploadButton from "~/ui/ButtonControls/UploadButton";
  import MediaSetupButton from "~/ui/ButtonControls/MediaSetupButton";
  import AudioModeButton from "~/ui/ButtonControls/AudioModeButton";
  import MicButton from "~/ui/ButtonControls/MicButton";
  import VideoButton from "~/ui/ButtonControls/VideoButton";
  import AvatarSetupButton from "~/ui/ButtonControls/AvatarSetupButton";
  import ShareScreenButton from "~/ui/ButtonControls/ShareScreenButton";

  import GroupUngroupButton from "~/ui/GroupUngroupButton";
  import WorldStatePane from "~/ui/WorldStatePane";
  import ResetWorldButton from "~/ui/ResetWorldButton";
  import Chat from "~/ui/Chat";

  import { PauseAutomatically, PauseMessage } from "~/ui/Pause";

  import { runCommand } from "~/commands";
  import { globalEvents } from "~/events";

  import { worldUIMode, openPanel, playState } from "~/stores";
  import { audioDesired } from "~/stores/audioDesired";
  import { videoDesired } from "~/stores/videoDesired";

  export let dispatch;
  export let buildModeAllowed = false;

  let buildMode = false;
  $: buildMode = buildModeAllowed && $worldUIMode === "build";

  const toPlayMode = () => {
    globalEvents.emit("switch-mode", "play");
  };

  const onUpload = ({ detail }) => {
    console.log("onUpload", detail.results);
    for (const result of detail.results) {
      if (result.types.webp) {
        runCommand("createPrefab", { name: "Image", src: result.types.webp });
      } else if (result.types.gltf) {
        runCommand("createPrefab", { name: "Thing", src: result.types.gltf });
      }
    }
  };
</script>

<overlay class:open={buildMode}>
  <overlay-panel class="interactive">
    {#if buildMode}
      {#if $openPanel === "collections"}
        <CollectionsPanel on:minimize={toPlayMode} />
      {/if}

      {#if $openPanel === "editor"}
        <EditorPanel on:minimize={toPlayMode} />
      {/if}

      {#if $openPanel === "export"}
        <ExportPanel on:minimize={toPlayMode} />
      {/if}

      {#if $openPanel === "performance"}
        <PerformancePanel on:minimize={toPlayMode} />
      {/if}

      {#if $openPanel === "settings"}
        <SettingsPanel on:minimize={toPlayMode} />
      {/if}

      <panel-tabs>
        <Button
          active={$openPanel === "collections"}
          on:click={() => ($openPanel = "collections")}>Collections</Button
        >
        <Button
          active={$openPanel === "editor"}
          on:click={() => ($openPanel = "editor")}>Editor</Button
        >
        <Button
          active={$openPanel === "export"}
          on:click={() => ($openPanel = "export")}>Export</Button
        >
        <Button
          active={$openPanel === "performance"}
          on:click={() => ($openPanel = "performance")}>Performance</Button
        >
        <Button
          active={$openPanel === "settings"}
          on:click={() => ($openPanel = "settings")}>Settings</Button
        >
      </panel-tabs>
    {/if}
  </overlay-panel>

  <overlay-content>
    <overlay-left class="interactive">
      {#if $playState === "paused"}
        <WorldStatePane />
      {/if}
      {#if buildMode}
        <GroupUngroupButton />
        <ResetWorldButton />
      {/if}
    </overlay-left>

    <overlay-right class="interactive">
      <AvatarSetupButton />
      <UploadButton on:uploaded={onUpload} />
    </overlay-right>
  </overlay-content>
</overlay>

<overlay-center>
  <play-buttons class="interactive">
    <ShareScreenButton />
    <AudioModeButton />
    <MicButton enabled={$audioDesired} />
    <VideoButton enabled={$videoDesired} />
    <MediaSetupButton {dispatch} />
  </play-buttons>
</overlay-center>

<Chat />

<!-- The virtual world! -->
<style>
  play-buttons {
    display: flex;
    justify-content: left;
    margin-bottom: 4px;
  }

  overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 3;

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
    position: fixed;
    z-index: 1;
    bottom: 8px;
    width: 100%;
    display: flex;
    justify-content: center;
    pointer-events: none;
  }
  play-buttons {
    pointer-events: all;
  }
  overlay-right {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    margin-right: 8px;
  }
  overlay-content {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
  }
  panel-tabs {
    display: flex;
    --margin: 0px;
    --bottom-radius: 0px;

    position: absolute;
    min-width: 500px;
    top: -20px;
    left: 300px;
    transform: translate(-50%) rotate(90deg) translate(50%, -50%);
  }
</style>