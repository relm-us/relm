<script lang="ts">
  import { onMount } from "svelte";

  import { worldManager } from "~/world";

  import { exportRelm, jsonFormat } from "~/world/Export";
  import type { FormatOpts } from "~/world/Export";
  import { parse } from "~/utils/parse";

  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";

  import Button from "~/ui/lib/Button";
  import SidePanel, { Header } from "~/ui/lib/SidePanel";
  import { _ } from "~/i18n";

  let text;
  let errorState = false;

  function applyText() {
    const json = parse(text);
    errorState = !worldManager.fromJSON(json);
  }

  function getExportJSON() {
    const meta: FormatOpts = {
      relm: worldManager.getRelmUrl(),
    };
    let exported;
    if (worldManager.selection.length > 0) {
      exported = exportRelm(worldManager.worldDoc, worldManager.selection.ids);
      meta.scope = "selection";
    } else {
      exported = exportRelm(worldManager.worldDoc);
      meta.scope = "all";
    }
    return jsonFormat(exported, meta);
  }

  onMount(() => {
    text = JSON.stringify(getExportJSON(), null, 2);
  });
</script>

<SidePanel on:minimize>
  <Header>{$_("ExportPanel.title")}</Header>
  <container>
    {#if errorState}
      <panel>
        <icon><IoIosClose /></icon><lbl>{$_("ExportPanel.invalid_json")}</lbl>
      </panel>
    {/if}
    <textarea bind:value={text} />
    <panel>
      <Button on:click={applyText}>{$_("ExportPanel.apply")}</Button>
    </panel>
  </container>
</SidePanel>

<style>
  container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  textarea {
    margin: 8px 16px;
    height: 100%;
    resize: none;
  }
  panel {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80px;
    width: 100%;
  }
  icon {
    display: block;
    width: 48px;
    height: 48px;
  }
</style>
