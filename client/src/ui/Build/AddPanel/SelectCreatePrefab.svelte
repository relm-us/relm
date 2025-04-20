<script lang="ts">
import Button from "~/ui/lib/Button"
import { createPrefabByName, directory } from "~/prefab"

const create = (name) => () => {
  createPrefabByName(name)
}
</script>

{#each directory as prefab}
  <Button style="margin-top:8px" on:click={create(prefab.name)}>
    {prefab.name}
  </Button>
{/each}
