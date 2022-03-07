<script lang="ts">
  import LeftPanel, { Header } from "~/ui/lib/LeftPanel";
  import Button from "~/ui/lib/Button";
  import { openPanel } from "~/stores/openPanel";

  import EntrywaySettings from "./EntrywaySettings.svelte";
  import SkyboxSettings from "./SkyboxSettings.svelte";
  import FogSettings from "./FogSettings.svelte";
  import CameraSettings from "./CameraSettings.svelte";
  import AudioSettings from "./AudioSettings.svelte";
  import LightingSettings from "./LightingSettings.svelte";
</script>

<LeftPanel on:minimize>
  <Header>Relm Settings</Header>
  <r-settings>
    <EntrywaySettings />

    <SkyboxSettings />

    <FogSettings />

    <CameraSettings />

    <AudioSettings />

    <LightingSettings />

    <r-buttons>
      <Button on:click={() => ($openPanel = "export")}>Import/Export</Button>
      <Button on:click={() => ($openPanel = "performance")}>Performance</Button>
    </r-buttons>
  </r-settings>
</LeftPanel>

<style>
  r-settings {
    display: flex;
    flex-direction: column;

    height: 100%;
  }
  r-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  r-buttons > :global(button) {
    margin: 4px;
  }
</style>
