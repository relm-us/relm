<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import groupBy from "./groupBy";
  import Select from "./Select/index";

  import { mediaDevices, defaultDeviceIds } from "../stores/index";
  import type { DeviceIds } from "../program";

  import {
    IconAudioEnabled,
    IconVideoEnabled,
    IconSoundSpeaker,
  } from "../../icons";

  export let preferredDeviceIds: DeviceIds;

  // DeviceSelector sends a 'selected' event when user selects anything
  const dispatch = createEventDispatcher();

  const kinds = ["videoinput", "audioinput", "audiooutput"];
  const icons = {
    videoinput: IconVideoEnabled,
    audioinput: IconAudioEnabled,
    audiooutput: IconSoundSpeaker,
  };

  function handleSelect(option, kind) {
    if (option.value !== preferredDeviceIds[kind]) {
      dispatch("changed", { kind, value: option.value });
    }
    dispatch("selected", { kind, value: option.value });
  }

  function selected(kind) {
    if (
      preferredDeviceIds[kind] &&
      $mediaDevices.find(
        (device) => device.deviceId === preferredDeviceIds[kind]
      )
    ) {
      return preferredDeviceIds[kind];
    } else {
      return $defaultDeviceIds[kind];
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
  let options = {};
  $: options = groupBy(
    $mediaDevices.map((input) => ({
      value: input.deviceId,
      label: input.label,
      kind: input.kind,
    })),
    "kind"
  );
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
