<script lang="ts">
  import type { State } from "~/main/ProgramTypes";

  import { AV_ENABLED } from "~/config/constants";
  
  import MicButton from "~/ui/ButtonControls/MicButton";
  import VideoButton from "~/ui/ButtonControls/VideoButton";
  import AvatarSetupButton from "~/ui/ButtonControls/AvatarSetupButton";
  import ShareScreenButton from "~/ui/ButtonControls/ShareScreenButton";
  import { SignInButton, LogoutButton } from "~/ui/ButtonControls/ConnectionButton";
  import InviteButton from "~/ui/ButtonControls/InviteButton";
  import ChatButton from "~/ui/Chat/ChatButton.svelte";

  import Chat from "~/ui/Chat";
  import MiniMap from "~/ui/MiniMap";

  // Debug UI
  import DebugPane from "~/ui/Debug/DebugPane";

  import { PauseAutomatically, PauseMessage } from "~/ui/Pause";
  import CenterCamera from "~/ui/CenterCamera";
  import Tooltip from "~/ui/lib/Tooltip";
  import Toolbar from "~/ui/Build/Toolbar";
  import BuildPanel from "~/ui/Build/BuildPanel";

  import { worldUIMode } from "~/stores";
  import { playState } from "~/stores/playState";
  import { chatOpen, unreadCount } from "~/stores/chat";
  import { localIdentityData } from "~/stores/identityData";
  import { debugMode } from "~/stores/debugMode";
  import { centerCameraVisible } from "~/stores/centerCameraVisible";
  import { showCenterButtons } from "~/stores/showCenterButtons";
  import { connectedAccount } from "~/stores/connectedAccount";
  import { permits } from "~/stores/permits";

  import SignInWindow from "../ButtonControls/ConnectionButton/SignInWindow.svelte";

  export let dispatch;
  export let state: State;
  export let tr = {};

  let signinEnabled = false;

  // i18n translations available, if passed in
  const _ = (phrase, key) => tr[key] || tr[phrase] || phrase;

  let buildMode = false;
  $: buildMode = $permits.includes("edit") && $worldUIMode === "build";
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
      {#if $permits.includes("invite")}
        <Tooltip
          tip={_("Invite someone to be with you here", "invite_someone")}
          top
        >
          <InviteButton />
        </Tooltip>
      {/if}

      {#if $connectedAccount}
        <Tooltip tip={_("Logout", "logout")} top>
          <LogoutButton />
        </Tooltip>
      {:else}
        <Tooltip tip={_("Connect your account!", "signin_button")} top>
          <SignInButton bind:enabled={signinEnabled} />
        </Tooltip>
      {/if}
    </play-buttons>
  </overlay-center>
{/if}

{#if signinEnabled}
  <SignInWindow bind:enabled={signinEnabled} {dispatch} />
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
  overlay-center {
    position: fixed;
    z-index: 3;
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
