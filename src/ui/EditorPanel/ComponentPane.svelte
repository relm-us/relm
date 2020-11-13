<script lang="ts">
  import { Pane } from "~/ui/LeftPanel";
  import Property from "./Property.svelte";

  export let Component;
  export let component;
</script>

<style>
</style>

<Pane title={Component.name}>
  {#each Object.entries(Component.props) as [key, prop]}
    <Property {key} bind:value={component[key]} {prop} />
  {/each}
</Pane>
