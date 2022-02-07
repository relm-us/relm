<script lang="ts">
  import Button from "~/ui/lib/Button";
  import { createPrefab, directory } from "~/prefab";

  const create = (name) => () => {
    createPrefab(name);
  };
</script>

{#each directory as prefab}
  <Button style="margin-top:8px" on:click={create(prefab.name)}>
    {prefab.name}
  </Button>
{/each}

<style>
  h2 {
    text-align: center;
    margin: 4px;
  }
</style>
