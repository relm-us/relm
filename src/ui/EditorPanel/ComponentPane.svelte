<script lang="ts">
  import { createEventDispatcher } from "svelte";

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
</script>

<Pane title={getTitle()} showClose={true} on:close={() => dispatch('destroy')}>
  {#each Object.entries(Component.props) as [key, prop]}
    {#if propVisible(prop)}
      <Property {key} bind:value={component[key]} {component} {prop} />
    {/if}
  {/each}
</Pane>
