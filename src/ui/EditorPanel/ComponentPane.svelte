<script lang="ts">
  import { Pane } from "~/ui/LeftPanel";
  import Property from "./Property.svelte";

  export let Component;
  export let component;

  const title = Component.name.split("_")[0];
</script>

<style>
</style>

<Pane {title}>
  {#each Object.entries(Component.props) as [key, prop]}
    <Property {key} bind:value={component[key]} {prop} />
  {/each}
</Pane>
