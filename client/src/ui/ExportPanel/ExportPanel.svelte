<script lang="ts">
  import { onMount } from "svelte";
  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";
  import Button from "~/ui/Button";
  import LeftPanel, { Header } from "~/ui/LeftPanel";
  import { parse } from "~/utils/parse";
  import { worldManager as wm } from "~/stores/worldManager";

  let text;
  let errorState = false;

  function applyText() {
    const json = parse(text);
    errorState = !$wm.fromJSON(json);
  }

  onMount(() => {
    text = JSON.stringify($wm.toJSON(), null, 2);
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
