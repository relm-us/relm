<script lang="ts">
  import { IntersectionFinder } from "./IntersectionFinder";
  import { difference } from "~/utils/setOps";
  import { Outline } from "~/ecs/plugins/outline";
  import { Selectable } from "~/ecs/components";
  import { OscillateRotation } from "~/ecs/plugins/composable";
  import { Quaternion, Euler } from "three";

  export let world;

  const finder = new IntersectionFinder(
    world.presentation.camera,
    world.presentation.scene
  );

  const selected: Set<string> = new Set();

  function onMousemove(event) {
    const coords = { x: event.offsetX, y: event.offsetY };
    const found: Set<string> = new Set(
      finder.find(coords, true).map((object) => object.userData.entityId)
    );

    const added = difference(found, selected);
    const removed = difference(selected, found);

    for (const entityId of added) {
      const entity = world.entities.getById(entityId);
      if (entity.has(Selectable)) {
        entity.add(Outline);
        entity.add(OscillateRotation, {
          cycles: 0.5,
          phase: (Math.PI / 2) * (Math.random() < 0.5 ? -1 : 1),
          frequency: 2,
          min: new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 10)),
          max: new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 10)),
        });
        selected.add(entityId);
      }
    }

    for (const entityId of removed) {
      const entity = world.entities.getById(entityId);
      entity.remove(Outline);
      selected.delete(entityId);
    }
  }
</script>

<svelte:window on:mousemove={onMousemove} />
