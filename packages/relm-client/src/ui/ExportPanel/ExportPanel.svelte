<script lang="ts">
  import { onMount } from "svelte";
  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";
  import Button from "~/ui/Button";
  import LeftPanel, { Header } from "~/ui/LeftPanel";
  import { parse } from "./parse";
  import { worldManager } from "~/stores/worldManager";
  import type WorldManager from "~/world/WorldManager";
  import { yEntityToJSON } from "~/y-integration/yToJson";
  import type { YEntity } from "~/y-integration/types";
  import { selectedEntities } from "~/stores/selection";

  let text;
  let errorState = false;

  function applyText() {
    const json = parse(text);
    if (json !== undefined && json.entities) {
      errorState = false;
      applyJson(json);
    } else {
      errorState = true;
    }
  }

  function applyJson(json) {
    const wm: WorldManager = $worldManager;
    selectedEntities.clear();
    const hids = [];
    json.entities.forEach((data) => {
      hids.push(data.id);
      wm.wdoc.syncFromJSON(data);
    });
    setTimeout(() => {
      hids.forEach((hid) => {
        selectedEntities.add(hid);
      });
    }, 1500);
  }

  onMount(() => {
    const wm: WorldManager = $worldManager;
    text = JSON.stringify(
      {
        version: "relm-export v.1.1",
        relm: wm.wdoc.name,
        entities: wm.wdoc.entities.map((e) => yEntityToJSON(e as YEntity)),
      },
      null,
      2
    );
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
