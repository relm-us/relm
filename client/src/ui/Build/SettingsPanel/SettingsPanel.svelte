<script lang="ts">
  import SidePanel, { Header } from "~/ui/lib/SidePanel";
  import Button from "~/ui/lib/Button";
  import { openPanel } from "~/stores/openPanel";

  import EntrywaySettings from "./EntrywaySettings.svelte";
  import SkyboxSettings from "./SkyboxSettings.svelte";
  import FogSettings from "./FogSettings.svelte";
  import CameraSettings from "./CameraSettings.svelte";
  import AudioSettings from "./AudioSettings.svelte";
  import LightingSettings from "./LightingSettings.svelte";

  import { _ } from "~/i18n";
</script>

<SidePanel on:minimize>
  <Header>{$_("SettingsPanel.relm_settings")}</Header>
  <r-settings>
    <EntrywaySettings />

    <SkyboxSettings />

    <FogSettings />

    <CameraSettings />

    <AudioSettings />

    <LightingSettings />

    <r-buttons>
      <Button on:click={() => ($openPanel = "export")}>{$_("SettingsPanel.import_export")}</Button>
      <Button on:click={() => ($openPanel = "performance")}>{$_("SettingsPanel.performance")}</Button>
    </r-buttons>
  </r-settings>
</SidePanel>

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
