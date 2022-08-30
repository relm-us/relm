<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import { worldManager } from "~/world";
  import { parse } from "~/utils/parse";

  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";

  import Button from "~/ui/lib/Button";
  import SidePanel, { Header } from "~/ui/lib/SidePanel";

  let text;
  let errorState = false;

  function applyText() {
    const json = parse(text);
    if (json) {
      const yActions = worldManager.worldDoc.actions.y;
      // TODO: make this collaboratively editable?
      yActions.clear();
      for (let [varName, possibilities] of Object.entries(json)) {
        yActions.set(varName, possibilities);
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

<SidePanel on:minimize>
  <Header>{$_("ActionsPanel.title")}</Header>
  <container>
    {#if errorState}
      <panel>
        <icon><IoIosClose /></icon><lbl>{$_("ActionsPanel.invalid_json")}</lbl>
      </panel>
    {/if}
    <textarea bind:value={text} />
    <panel>
      <Button on:click={applyText}>{$_("ActionsPanel.apply")}</Button>
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
