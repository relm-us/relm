<script lang="ts">
  import * as Y from "yjs";
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

  (window as any).Y = Y;

  const world = new World({
    plugins: [CorePlugin, ThreePlugin, TransformEffectsPlugin],
  });
  (window as any).world = world;

  const worldDoc = new WorldDoc("sandbox", world);
  (window as any).worldDoc = worldDoc;

  let id = uuidv4();
  const entity = world.entities.create("Box-1");
  const entity2 = world.entities.create("Child");
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
  worldDoc.update(entity);
  worldDoc.update(entity2);

  entity2.setParent(entity);
  worldDoc.update(entity);
  worldDoc.update(entity2);
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
