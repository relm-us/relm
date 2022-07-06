<script lang="ts">
  import type { State } from "~/main/ProgramTypes";

  import MicButton from "~/ui/ButtonControls/MicButton";
  import VideoButton from "~/ui/ButtonControls/VideoButton";
  import AvatarSetupButton from "~/ui/ButtonControls/AvatarSetupButton";
  import ShareScreenButton from "~/ui/ButtonControls/ShareScreenButton";
  import InviteButton from "~/ui/ButtonControls/InviteButton";
  import ChatButton from "~/ui/Chat/ChatButton.svelte";
  import Button from "~/ui/lib/Button";

  import Chat from "~/ui/Chat";
  import MiniMap from "~/ui/MiniMap";

  // Build Mode UI
  import AddPanel from "~/ui/Build/AddPanel";
  import ModifyPanel from "~/ui/Build/ModifyPanel";
  import ActionsPanel from "~/ui/Build/ActionsPanel";
  import SettingsPanel from "~/ui/Build/SettingsPanel";
  import ExportPanel from "~/ui/Build/ExportPanel";
  import GroupUngroupButton from "~/ui/Build/GroupUngroupButton";

  // Debug UI
  import WorldStatePane from "~/ui/Debug/WorldStatePane";
  import PerformancePanel from "~/ui/Debug/PerformancePanel";

  import { PauseAutomatically, PauseMessage } from "~/ui/Pause";
  import CenterCamera from "~/ui/CenterCamera";
  import Tooltip from "~/ui/lib/Tooltip";

  import { globalEvents } from "~/events";

  import { worldUIMode, openPanel, audioMode } from "~/stores";
  import { playState } from "~/stores/playState";
  import { chatOpen, unreadCount } from "~/stores/chat";
  import { localIdentityData } from "~/stores/identityData";
  import { debugMode } from "~/stores/debugMode";
  import { centerCameraVisible } from "~/stores/centerCameraVisible";
  import { selectedEntities } from "~/stores/selection";
  import { showCenterButtons } from "~/stores/showCenterButtons";
  import { AV_ENABLED } from "~/config/constants";
import SignInButton from "../ButtonControls/SignInButton";

  export let dispatch;
  export let permits;
  export let state: State;
  export let tr = {};

  // i18n translations available, if passed in
  const _ = (phrase, key) => tr[key] || tr[phrase] || phrase;

  let buildMode = false;
  $: buildMode = permits.includes("edit") && $worldUIMode === "build";

  const toPlayMode = () => {
    globalEvents.emit("switch-mode", "play");
  };
</script>

<!-- Pause game if participant is not focused on window, to save CPU/GPU resources -->
<PauseAutomatically />

{#if $playState === "paused"}
  <PauseMessage />
{/if}

{#if $centerCameraVisible}
  <CenterCamera />
{/if}

{#if $showCenterButtons}
  <MiniMap />
{/if}

<overlay class:open={buildMode}>
  <overlay-panel class="interactive">
    {#if buildMode}
      {#if $openPanel === "add"}
        <AddPanel on:minimize={toPlayMode} />
      {/if}

      {#if $openPanel === "modify"}
        <ModifyPanel on:minimize={toPlayMode} {permits} />
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

      <panel-tabs>
        <Button
          active={$openPanel === "add"}
          on:click={() => ($openPanel = "add")}>Add</Button
        >
        <Button
          active={$openPanel === "modify"}
          on:click={() => ($openPanel = "modify")}>Modify</Button
        >
        <Button
          active={$openPanel === "actions"}
          on:click={() => ($openPanel = "actions")}>Actions</Button
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
      {#if $playState === "paused" || $debugMode}
        <WorldStatePane {state} />
      {/if}
      {#if buildMode && $selectedEntities.size > 0}
        <GroupUngroupButton />
      {/if}
    </overlay-left>
  </overlay-content>
</overlay>

{#if $showCenterButtons}
  <overlay-center>
    <play-buttons class="interactive">
      {#if AV_ENABLED}
        <Tooltip tip={_("Set up video", "set_up_video")} top>
          <VideoButton enabled={$localIdentityData.showVideo} {dispatch} />
        </Tooltip>
        <Tooltip
          tip={$localIdentityData.showAudio
            ? _("Mute", "mute")
            : _("Unmute", "unmute")}
          top
        >
          <MicButton enabled={$localIdentityData.showAudio} />
        </Tooltip>
        <Tooltip tip={_("Share screen", "share_screen")} top>
          <ShareScreenButton />
        </Tooltip>

        <div style="width:16px" />
      {/if}

      <Tooltip
        tip={$chatOpen
          ? _("Close chat", "chat_close")
          : _("Open chat", "chat_open")}
        top
      >
        <ChatButton unread={$unreadCount} />
      </Tooltip>
      <Tooltip tip={_("Change how you look", "avatar_setup")} top>
        <AvatarSetupButton />
      </Tooltip>
      {#if permits.includes("invite")}
        <Tooltip
          tip={_("Invite someone to be with you here", "invite_someone")}
          top
        >
          <InviteButton {permits} />
        </Tooltip>
      {/if}

      <Tooltip
        tip={_("Connect your account!", "signin_button")}
        top>
          <SignInButton />
      </Tooltip>
    </play-buttons>
  </overlay-center>
{/if}

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
