<script lang="ts">
  import * as Y from "yjs";
  import { WebsocketProvider } from "y-websocket";
  import CorePlugin, {
    WorldTransform,
    Transform,
    Vector3,
  } from "hecs-plugin-core";
  import ThreePlugin, { Shape } from "hecs-plugin-three";
  import TransformEffectsPlugin, {
    TransformEffects,
  } from "~/ecs/plugins/transform-effects";
  import { WorldDoc } from "./y-integration/WorldDoc";
  import { World } from "hecs";
  import { uuidv4 } from "~/utils/uuid";
  import { makeBox } from "~/prefab";
  import { createWorld } from "~/world/creation";

  (window as any).Y = Y;

  function keepYDocsInSync(ydoc1, ydoc2) {
    ydoc1.on("update", (update) => {
      Y.applyUpdate(ydoc2, update);
    });

    ydoc2.on("update", (update) => {
      Y.applyUpdate(ydoc1, update);
    });
  }

  let world1, world2;
  let worldDoc1, worldDoc2;
  import("@dimforge/rapier3d").then((rapier) => {
    world1 = createWorld(rapier);
    (window as any).world1 = world1;

    worldDoc1 = new WorldDoc({
      name: "sandbox1",
      world: world1,
      connection: {
        url: "ws://localhost:1234",
      },
    });

    world2 = createWorld(rapier);
    (window as any).world2 = world2;

    worldDoc2 = new WorldDoc({
      name: "sandbox1",
      world: world2,
      connection: {
        url: "ws://localhost:1234",
      },
    });
    (window as any).wdoc = worldDoc2;

    let id = uuidv4();
    const box = makeBox(world1, {});
    console.log("made box", box);
    worldDoc1.syncFrom(box);

    keepYDocsInSync(worldDoc1.ydoc, worldDoc2.ydoc);

    console.log("world2 ydoc", worldDoc2.ydoc.toJSON());
  });
  // const entity = world.entities.create("Box-1");
  // const entity2 = world.entities.create("Child");
  // entity.add(Shape, {
  //   kind: "BOX",
  //   boxSize: new Vector3(1, 2, 1),
  // });
  // entity.add(TransformEffects, {
  //   effects: [
  //     {
  //       function: "oscillate-scale",
  //       params: {
  //         phase: 0,
  //         min: new Vector3(0.99, 1, 0.99),
  //         max: new Vector3(1.02, 1, 1.02),
  //       },
  //     },
  //   ],
  // });
  // worldDoc.update(entity);
  // worldDoc.update(entity2);

  // entity2.setParent(entity);
  // worldDoc.update(entity);
  // worldDoc.update(entity2);
  // worldDoc.captureChanges(entity, () => {
  // const shape = entity.get(Shape);
  // shape.sphereRadius = 10;
  // entity.remove(Transform);
  // entity.add(Shape, {
  //   kind: "BOX",
  //   boxSize: new Vector3(1, 2, 1),
  // });
  // const effects = entity.get(TransformEffects);
  // effects.effects[0].params.phase = 1;
  // transform.position.set(1, 2, 4);
  // });
  // worldDoc.transact((doc) => {
  //   doc.create("Box-1", id).add(Transform, {
  //     position: new Vector3(1, 2, 3),
  //   });
  // });
  // worldDoc.transact((doc) => {
  //   const component = doc.getById(id).get(Transform)
  //   component.
  // });
  // worldDoc.transact((doc) => {
  //   doc.getById(id).add(Transform, {
  //     position: new Vector3(1, 2, 3),
  //   });
  // });
</script>
