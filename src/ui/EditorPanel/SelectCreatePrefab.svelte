<script lang="ts">
  import Button from "~/ui/Button";
  import { worldManager } from "~/stores/worldManager";
  import { selectedEntities } from "~/stores/selection";
  import { directory } from "~/prefab";

  const activate = (entity) => {
    entity.activate();
    $worldManager.wdoc.syncFrom(entity);
    for (const child of entity.getChildren()) {
      activate(child);
    }
  };
  const create = (prefab) => () => {
    // Clear current selection, if any
    selectedEntities.clear();

    let entities = prefab.prefab($worldManager.world, { y: 0.5, z: -10 });
    if (!(entities instanceof Array)) entities = [entities];

    for (const entity of entities) {
      activate(entity);
      // Select the new entity
      selectedEntities.add(entity.id);
    }
  };
</script>

{#each directory as prefab}
  <Button style="margin-top:8px" on:click={create(prefab)}>
    Create
    {prefab.name}
  </Button>
{/each}
