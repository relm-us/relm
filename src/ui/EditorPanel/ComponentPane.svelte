<script lang="ts">
  import { onMount } from "svelte";

  import { Pane } from "~/ui/LeftPanel";
  import Property from "./Property.svelte";

  export let Component;
  export let component;

  const getTitle = () => {
    const parts = Component.name.split("_");
    if (parts.length > 1) {
      return parts[1];
    } else {
      return parts[0];
    }
  };

  // onMount(() => {
  //   const interval = setInterval(() => {
  //     if (getTitle() === "ComposableTransform") {
  //       component.position.x += 0.1;
  //     }
  //   }, 500);

  //   return () => clearInterval(interval);
  // });
</script>

<style>
</style>

<Pane title={getTitle()}>
  {#each Object.entries(Component.props) as [key, prop]}
    <Property {key} bind:value={component[key]} {component} {prop} />
  {/each}
</Pane>
