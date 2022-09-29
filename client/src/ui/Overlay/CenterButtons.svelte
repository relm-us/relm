<script lang="ts">
  import { fade } from "svelte/transition";
  import { _ } from "~/i18n";

  import { AV_ENABLED, CROSS_FADE_DURATION } from "~/config/constants";

  import { localIdentityData } from "~/stores/identityData";
  import { unreadCount } from "~/stores/unreadCount";
  import { permits } from "~/stores/permits";

  import Tooltip from "~/ui/lib/Tooltip";

  import MicButton from "./ButtonControls/MicButton.svelte";
  import VideoButton from "./ButtonControls/VideoButton.svelte";
  import ShareScreenButton from "./ButtonControls/ShareScreenButton.svelte";
  import InviteButton from "./ButtonControls/InviteButton.svelte";
  import ChatButton from "./ButtonControls/ChatButton.svelte";
  import ProfileButton from "./ButtonControls/ProfileButton.svelte";

  export let dispatch;
</script>

<overlay-center transition:fade={{ duration: CROSS_FADE_DURATION }}>
  <play-buttons class="interactive">
    {#if AV_ENABLED}
      <Tooltip tip={$_("Overlay.tooltips.set_up_video")} top>
        <VideoButton enabled={$localIdentityData.showVideo} {dispatch} />
      </Tooltip>
      <Tooltip
        tip={$localIdentityData.showAudio
          ? $_("Overlay.tooltips.mute")
          : $_("Overlay.tooltips.unmute")}
        top
      >
        <MicButton enabled={$localIdentityData.showAudio} />
      </Tooltip>
      <Tooltip tip={$_("Overlay.tooltips.share_screen")} top>
        <ShareScreenButton />
      </Tooltip>

      <div style="width:16px" />
    {/if}

    <Tooltip tip={$_("Overlay.tooltips.chat_open")} top>
      <ChatButton unread={$unreadCount} />
    </Tooltip>
    {#if $permits.includes("invite")}
      <Tooltip tip={$_("Overlay.tooltips.invite_someone")} top>
        <InviteButton />
      </Tooltip>
    {/if}

    <!-- TODO: if wrapped in Tooltip, tooltip flickers; Overlay.tooltips.profile -->
    <ProfileButton />
  </play-buttons>
</overlay-center>

<style>
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
    display: flex;
    justify-content: left;
    margin-bottom: 4px;
    pointer-events: all;
  }
</style>
