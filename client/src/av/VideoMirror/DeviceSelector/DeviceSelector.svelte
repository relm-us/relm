<script lang="ts">
import { createEventDispatcher } from "svelte"

import groupBy from "./groupBy"
import Select from "./Select/index"

import { mediaDevices } from "../stores/index"
import type { DeviceIds } from "../program"

import { IconAudioEnabled, IconVideoEnabled, IconSoundSpeaker } from "../../icons"
import { localAudioDeviceId } from "../stores/localAudioDeviceId"
import { localVideoDeviceId } from "../stores/localVideoDeviceId"

export let preferredDeviceIds: DeviceIds

// DeviceSelector sends a 'selected' event when user selects anything
const dispatch = createEventDispatcher()

const icons = {
  videoinput: IconVideoEnabled,
  audioinput: IconAudioEnabled,
  audiooutput: IconSoundSpeaker,
}

function handleSelect(option, kind) {
  if (option.value !== preferredDeviceIds[kind]) {
    dispatch("changed", { kind, value: option.value })
  }
  dispatch("selected", { kind, value: option.value })
}

function selected(kind: string) {
  if (preferredDeviceIds[kind] && $mediaDevices.find((device) => device.deviceId === preferredDeviceIds[kind])) {
    return preferredDeviceIds[kind]
  } else {
    let deviceId = null
    if (kind === "audioinput" && $localAudioDeviceId) {
      deviceId = $localAudioDeviceId
    } else if (kind === "videoinput" && $localVideoDeviceId) {
      deviceId = $localVideoDeviceId
    } else if (kind === "audiooutput") {
      const deviceDefault = $mediaDevices.find((d) => d.kind === "audiooutput" && d.deviceId === "default")
      const device = $mediaDevices.find((d) => d.kind === "audiooutput" && d.deviceId !== "default")
      if (deviceDefault) deviceId = deviceDefault.deviceId
      else if (device) deviceId = device.deviceId
    }
    return deviceId
  }
}

/**
 * Options are derived from deviceList: i.e. an object grouped by the kind of device:
 * {
 *   videoinput: [{ ... }, ...],
 *   audioinput: [{ ... }, ...],
 *   audiooutput: [{ ... }, ...],
 * }
 */
let options = {}
$: options = groupBy(
  $mediaDevices.map((input) => ({
    value: input.deviceId,
    label: input.label,
    kind: input.kind,
  })),
  "kind",
)
</script>

{#each Object.keys(icons) as kind}
  {#if options[kind] && options[kind].length > 0}
    <Select
      selected={selected(kind)}
      onSelect={(option) => {
        handleSelect(option, kind);
      }}
      options={options[kind]}
      icon={icons[kind]}
    />
  {/if}
{/each}
