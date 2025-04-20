<script lang="ts">
import type { DeviceIds } from "~/av/VideoMirror"

import { createEventDispatcher } from "svelte"
import { VideoMirror } from "~/av/VideoMirror"
import { _ } from "svelte-i18n"

import { askMediaSetup } from "~/stores/askMediaSetup"
import ToggleSwitch from "~/ui/lib/ToggleSwitch"
import PageOverlay from "~/ui/lib/PageOverlay"
import { config } from "~/config"

export let audioDesired = true
export let videoDesired = true
export let preferredDeviceIds: DeviceIds

const dispatch = createEventDispatcher()

function joinWithout() {
  dispatch("done")
}
</script>

<PageOverlay zIndex={5}>
  <logo>
    <img src={config.logoUrl} alt={$_("MediaSetup.logo")} />
  </logo>

  <message>
    {$_("MediaSetup.you're_about_to_join")}
  </message>

  <VideoMirror
    on:done
    {audioDesired}
    {videoDesired}
    {preferredDeviceIds}
    autoFocus={true}
  />

  <or>{$_("MediaSetup.or")}</or>
  <button on:click={joinWithout}> {$_("MediaSetup.join_without")} </button>

  <div class="skip">
    <ToggleSwitch
      bind:enabled={$askMediaSetup}
      labelOff="Skip this screen next time"
      labelOn="Ask me again next time"
    />
  </div>
</PageOverlay>

<style>
  logo {
    display: block;

    width: 50vw;
    height: 150px;
    max-width: 300px;
    max-height: 150px;

    margin-top: 5vh;
  }

  logo img {
    width: 100%;
  }

  message {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    text-align: center;
    margin: 8px 8px 3vh 8px;
  }

  or {
    font-size: 18px;
    color: #bbb;
    margin: 16px 0px;
  }

  button {
    border: none;
    background-color: transparent;
    padding: 4px 8px;
    cursor: pointer;

    text-decoration: underline;
    font-size: 18px;
    color: #bbb;
  }

  .skip {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    color: #b0b0b0;
    margin: 3vh 8px 3vh 8px;
  }
</style>
