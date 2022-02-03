<script lang="ts">
  import LeftPanel, { Header } from "~/ui/LeftPanel";
  import EntrywaySettings from "./EntrywaySettings.svelte";
  import SkyboxSettings from "./SkyboxSettings.svelte";
  import FogSettings from "./FogSettings.svelte";
  import LightingSettings from "./LightingSettings.svelte";
</script>

<LeftPanel on:minimize>
  <Header>Relm Settings</Header>
  <r-settings>
    <EntrywaySettings />

    <SkyboxSettings />

    <FogSettings />

    <LightingSettings />
  </r-settings>
</LeftPanel>

<style>
  r-settings {
    display: flex;
    flex-direction: column;

    height: 100%;
  }
</style>
