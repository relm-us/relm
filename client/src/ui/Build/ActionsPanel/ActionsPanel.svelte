<script lang="ts">
  import { onMount } from "svelte";

  import { worldManager } from "~/world";
  import { parse } from "~/utils/parse";

  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";

  import Button from "~/ui/lib/Button";
  import LeftPanel, { Header } from "~/ui/lib/LeftPanel";
  import { get } from "svelte/store";

  let text;
  let errorState = false;

  function applyText() {
    const json = parse(text);
    if (json) {
      for (let [varName, possibilities] of Object.entries(json)) {
        worldManager.worldDoc.actions.y.set(varName, possibilities);
      }
    } else {
      errorState = true;
    }
  }

  onMount(() => {
    const json = worldManager.worldDoc.actions.y.toJSON();
    text = JSON.stringify(json, null, 2);
  });
</script>

<LeftPanel on:minimize>
  <Header>Actions</Header>
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
