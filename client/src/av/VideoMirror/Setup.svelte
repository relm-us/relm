<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { _ } from "svelte-i18n";

  import {
    IconAudio,
    IconVideo,
    IconSettings,
    IconVideoDisabled,
  } from "~/av/icons";
  import AudioLevelIndicator from "~/av/components/AudioLevelIndicator";

  import VideoBox from "./VideoBox.svelte";
  import ContinueButton from "./ContinueButton.svelte";
  import DeviceSelector from "./DeviceSelector/index";
  import { DeviceIds } from "./program";

  export let stream: MediaStream;
  export let videoDesired: boolean;
  export let audioDesired: boolean;
  export let preferredDeviceIds: DeviceIds;
  export let permissionBlocked: boolean;

  export let toggleAudioDesired: () => void;
  export let toggleVideoDesired: () => void;
  export let handleDeviceSelected: <T>(message: T) => void;
  export let handleRequestPermission: (
    shake: () => void
  ) => (e: CustomEvent<any>) => void;
  export let handleDone: () => void;
  export let autoFocus: boolean;

  let videoBox: VideoBox | null = null;
  let advancedSettings = false;

  // Ignore missing props warning
  $$props;
</script>

<mirror>
  {#if stream}
    <VideoBox
      bind:this={videoBox}
      enabled={videoDesired}
      track={stream.getVideoTracks()[0]}
    >
      {#if stream.getVideoTracks().length === 0}
        {#if !audioDesired}
          <div class="message highlight">
            {$_("VideoMirror.join_mic_off")}
          </div>
        {:else}
          <div />
        {/if}
        <div class="message highlight" style="background-color: transparent">
          {$_("VideoMirror.cam_unavailable")}
        </div>
      {:else if !audioDesired && !videoDesired}
        <div class="message highlight">
          {$_("VideoMirror.join_cam_mic_off")}
        </div>
      {:else if !videoDesired}
        <div class="message highlight">
          {$_("VideoMirror.join_cam_off")}
        </div>
      {:else if !audioDesired}
        <div class="message highlight">
          {$_("VideoMirror.join_mic_off")}
        </div>
      {:else}
        <div />
      {/if}

      <div class="button-bar">
        <button
          on:click={toggleVideoDesired}
          class:track-disabled={!videoDesired}
        >
          <icon><IconVideo enabled={videoDesired} /></icon>
        </button>
        <button
          class="audio-level-button"
          class:track-disabled={!audioDesired}
          on:click={toggleAudioDesired}
        >
          {#if audioDesired}
            <AudioLevelIndicator {stream}>
              <icon class="audio-level-icon">
                <IconAudio enabled={audioDesired} />
              </icon>
            </AudioLevelIndicator>
          {:else}
            <icon class="audio-level-icon">
              <IconAudio enabled={audioDesired} />
            </icon>
          {/if}
        </button>
        <button
          class="corner"
          class:inverted={advancedSettings}
          on:click={() => {
            advancedSettings = !advancedSettings;
          }}
        >
          <icon><IconSettings /></icon>
        </button>
      </div>
    </VideoBox>

    <div class="advanced-settings">
      {#if advancedSettings}
        <div transition:slide>
          <DeviceSelector
            on:changed={handleDeviceSelected}
            {preferredDeviceIds}
          />
        </div>
      {/if}
    </div>

    <ContinueButton on:click={handleDone} {autoFocus}>
      {$_("VideoMirror.continue")}
    </ContinueButton>
  {:else}
    <VideoBox bind:this={videoBox} blocked={permissionBlocked} opaque={true}>
      <div class="centered-image">
        <icon style="--size:75px"><IconVideoDisabled /></icon>
      </div>
      <div class="message blocked">
        {#if permissionBlocked}
          {$_("VideoMirror.cam_mic_blocked")}
        {:else}
          {$_("VideoMirror.cam_mic_not_active")}
        {/if}
      </div>
    </VideoBox>

    <!-- Keep as spacer -->
    <div class="advanced-settings" />

    <div in:fade={{ duration: 800, delay: 200 }}>
      <ContinueButton
        on:click={handleRequestPermission(videoBox.shake)}
        {autoFocus}
      >
        {#if permissionBlocked}
          {$_("VideoMirror.try_again")}
        {:else}
          {$_("VideoMirror.request_perms")}
        {/if}
      </ContinueButton>
    </div>
  {/if}
</mirror>

<style>
  mirror {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 500px;
  }
  .centered-image {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    margin-top: 15px;
  }
  .message {
    color: #eee;
    background-color: rgba(33, 33, 33, 0.5);
    border-radius: 10px;
    padding: 8px 15px;
    margin: 8px;
    text-align: center;

    font-family: Verdana, Geneva, Tahoma, sans-serif;
  }
  .button-bar {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .button-bar button {
    display: flex;

    color: white;
    background-color: rgba(33, 33, 33, 0.5);
    border: none;
    border-radius: 8px;
    margin: 8px;

    font-size: 18px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    padding: 8px 15px;
  }
  .button-bar button.track-disabled {
    background-color: rgba(255, 85, 85, 0.7);
  }
  .button-bar button:hover {
    background-color: rgba(115, 115, 115, 0.7);
  }
  .button-bar button.track-disabled:hover {
    background-color: rgba(255, 115, 115, 0.7);
  }
  .button-bar button.corner {
    position: absolute;
    right: 10px;
  }

  .audio-level-button {
    padding: 0 !important;
  }
  .audio-level-icon {
    margin: 8px 15px;
  }

  icon {
    display: block;
    width: var(--size, 32px);
    height: var(--size, 32px);
    color: white;
  }

  button.inverted {
    background-color: #eee;
  }
  button.inverted:hover {
    background-color: #fff;
  }
  button.inverted icon {
    color: rgba(33, 33, 33, 0.5);
  }

  .advanced-settings {
    margin-top: 12px;
    margin-bottom: 12px;
  }
</style>
