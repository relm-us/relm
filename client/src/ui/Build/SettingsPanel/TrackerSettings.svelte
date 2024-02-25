<script lang="ts">
  import { onMount } from "svelte";

  import { worldManager } from "~/world";

  import Pane from "~/ui/lib/Pane";

  import { _ } from "~/i18n";

  let gtmId;

  $: {
    if (gtmId) {
      worldManager.worldDoc.settings.y.set("gtmId", gtmId);
    }
  }

  onMount(() => {
    gtmId = worldManager.worldDoc.settings.y.get("gtmId");
  });
</script>

<Pane title={$_("TrackingSettings.title")}>
  <r-setting style="padding-top: 4px">
    <r-title>
      {$_("TrackingSettings.gtm")}
    </r-title>
    <r-value>
      <input type="text" bind:value={gtmId} />
    </r-value>
  </r-setting>
</Pane>

<style>
  r-setting {
    display: flex;
    flex-direction: column;
    padding: 16px 0;
    border-bottom: 1px solid #555;
  }
  r-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  r-value {
    display: block;
    margin: 8px 0 0 0;
  }
  input {
    background-color: rgba(0, 0, 0, 0);
    color: white;
    border: 1px solid #999;
    border-radius: 2px;
    margin-left: 8px;
  }
</style>
