<script lang="ts">
  import { onMount } from "svelte";

  import { Relm } from "~/stores/Relm";
  import { config } from "~/config";

  import { exportRelm, jsonFormat } from "~/world/Export";
  import type { FormatOpts } from "~/world/Export";
  import { parse } from "~/utils/parse";

  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";

  import Button from "~/ui/lib/Button";
  import LeftPanel, { Header } from "~/ui/LeftPanel";

  let text;
  let errorState = false;

  function applyText() {
    const json = parse(text);
    errorState = !$Relm.fromJSON(json);
  }

  onMount(() => {
    const meta: FormatOpts = {
      // TODO: use whatever is the current relm
      relm: config.initialSubrelm,
      server: config.serverUrl,
    };
    let exported;
    if ($Relm.selection.length > 0) {
      exported = exportRelm($Relm.wdoc, $Relm.selection.ids);
      meta.scope = "selection";
    } else {
      exported = exportRelm($Relm.wdoc);
    }
    const json = jsonFormat(exported, meta);
    text = JSON.stringify(json, null, 2);
  });
</script>

<LeftPanel on:minimize>
  <Header>Import / Export</Header>
  <container>
    {#if errorState}
      <panel>
        <icon><IoIosClose /></icon><lbl>Invalid JSON</lbl>
      </panel>
    {/if}
    <textarea bind:value={text} />
    <panel>
      <Button on:click={applyText}>Apply</Button>
    </panel>
  </container>
</LeftPanel>

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
