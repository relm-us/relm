<script lang="ts">
  import * as Y from "yjs";
  import CorePlugin, {
    WorldTransform,
    Transform,
    Vector3,
  } from "hecs-plugin-core";
  import {
    withArrayEdits,
    withMapEdits,
    YEntities,
    YEntity,
    YComponents,
    YComponent,
    YValues,
    YValue,
  } from "./world/y-utils";
  import { WorldDoc } from "./world/y-integration";
  import { World } from "hecs";

  (window as any).Y = Y;

  const world = new World({ plugins: [CorePlugin] });
  (window as any).world = world;

  const worldDoc = new WorldDoc("sandbox", world);
  (window as any).worldDoc = worldDoc;

  const yentity = worldDoc
    .create("Box-1")
    .add(Transform, {
      position: new Vector3(1, 2, 3),
    })
    .build();

  worldDoc.addComponent(yentity._item.id, WorldTransform, {
    position: new Vector3(1, 0, 0),
  });
  // worldDoc.destroy(yentity._item.id);
</script>
