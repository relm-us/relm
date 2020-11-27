<script lang="ts">
  import Button from "~/ui/Button";
  import { worldManager } from "~/stores/worldManager";
  import { WorldTransform } from "hecs-plugin-core";
  import { directory } from "~/prefab";

  const activate = (entity) => {
    entity.activate();
    $worldManager.wdoc.syncFrom(entity);
    for (const child of entity.getChildren()) {
      activate(child);
    }
  };
  const create = (prefab) => () => {
    const transform = $worldManager.avatar?.get(WorldTransform);
    if (transform) {
      const x = transform.position.x;
      const z = transform.position.z;
      let entities = prefab.prefab($worldManager.world, { x, y: 0.5, z });
      if (!(entities instanceof Array)) entities = [entities];

      for (const entity of entities) {
        activate(entity);
      }
    } else {
      console.error(`Can't create prefab, avatar not found`);
    }
  };
</script>

{#each directory as prefab}
  <Button style="margin-top:8px" on:click={create(prefab)}>
    Create
    {prefab.name}
  </Button>
{/each}
