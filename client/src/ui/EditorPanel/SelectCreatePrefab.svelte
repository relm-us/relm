<script lang="ts">
  import Button from "~/ui/Button";
  import { worldManager } from "~/stores/worldManager";
  import { WorldTransform } from "~/ecs/plugins/core";
  import { directory } from "~/prefab";

  const PLAYER_CENTER_HEIGHT = 0.755;

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
      const y = transform.position.y - PLAYER_CENTER_HEIGHT;
      const z = transform.position.z;
      let entities = prefab.prefab($worldManager.world, { x, yOffset: y, z });
      if (!(entities instanceof Array)) entities = [entities];

      for (const entity of entities) {
        activate(entity);
      }
    } else {
      console.error(`Can't create prefab, avatar not found`);
    }
  };
</script>

<h2>Click to Create:</h2>
{#each directory as prefab}
  <Button style="margin-top:8px" on:click={create(prefab)}>
    {prefab.name}
  </Button>
{/each}

<style>
  h2 {
    text-align: center;
    margin: 4px;
  }
</style>
