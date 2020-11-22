<script lang="ts">
  import * as Y from "yjs";
  import CorePlugin, {
    WorldTransform,
    Transform,
    Vector3,
  } from "hecs-plugin-core";
  import { WorldDoc } from "./world/y-integration";
  import { World } from "hecs";
  import { uuidv4 } from "~/utils/uuid";

  (window as any).Y = Y;

  const world = new World({ plugins: [CorePlugin] });
  (window as any).world = world;

  const worldDoc = new WorldDoc("sandbox", world);
  (window as any).worldDoc = worldDoc;

  let id = uuidv4();
  worldDoc.transact((doc) => {
    doc.create("Box-1", id).add(Transform, {
      position: new Vector3(1, 2, 3),
    });
  });
  worldDoc.transact((doc) => {
    doc.getById(id).add(Transform, {
      position: new Vector3(1, 2, 3),
    });
  });
</script>
