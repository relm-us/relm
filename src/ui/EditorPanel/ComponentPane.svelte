<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Tag from "./Tag.svelte";

  import { Pane } from "~/ui/LeftPanel";
  import Property from "./Property.svelte";

  export let Component;
  export let component;

  const dispatch = createEventDispatcher();

  const getTitle = () => {
    const parts = Component.name.split("_");
    if (parts.length > 1) {
      return parts[1];
    } else {
      return parts[0];
    }
  };

  const propVisible = (prop) => {
    if (prop.editor && prop.editor.requires) {
      // if the `editor.requires` field exists, check if we meet criteria
      return prop.editor.requires.reduce((acc, item) => {
        return acc && component[item.prop] === item.value;
      }, true);
    } else {
      // by default, all props are shown
      return true;
    }
  };

  const debugComponent = () => {
    console.log(component);
    (window as any).component = component;
  };
</script>

<style>
  toolbar {
    display: flex;
    margin: 8px 16px 8px 16px;
    padding-top: 8px;
    border-top: 1px solid #555;
  }
</style>

<Pane title={getTitle()} showClose={true} on:close={() => dispatch('destroy')}>
  {#each Object.entries(Component.props) as [key, prop]}
    {#if propVisible(prop)}
      <Property {key} {component} {prop} />
    {/if}
  {/each}
  <toolbar>
    <Tag on:mousedown={debugComponent} cursor="pointer">Debug</Tag>
  </toolbar>
</Pane>
