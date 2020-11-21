<script lang="ts">
  import * as Y from "yjs";
  import { Transform, Vector3 } from "hecs-plugin-core";
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

  const world = new World();
  const worldDoc = new WorldDoc("sandbox", world);

  worldDoc
    .create("Box-1")
    .add(Transform, {
      position: new Vector3(1, 2, 3),
    })
    .build();

  /*
  let entity: YEntity;
  let c1values: YValues;
  let c2values: YValues;

  ydoc.transact(() => {
    for (let i = 0; i < 2; i++) {
      entity = new Y.Map();
      // entity.observe(observeEntity)

      entities.push([entity]);

      entity.set("name", `Box-${i}`);

      const components: Y.Array<YComponent> = new Y.Array();
      // components.observe(observeComponents);

      entity.set("components", components);

      const component1: YComponent = new Y.Map();
      // component1.observe(observeComponent)
      {
        component1.set("name", "Transform");

        c1values = new Y.Map();
        // c1values.observe(observeProperties)

        component1.set("values", c1values);

        c1values.set("position", [1, 2, 3]);
        c1values.set("scale", [1, 1, 1]);
      }

      const component2: YComponent = new Y.Map();
      // component2.observe(observeComponent)
      {
        component2.set("name", "Shape");

        c2values = new Y.Map();
        // c2values.observe(observeProperties)

        component2.set("values", c2values);

        c2values.set("kind", "BOX");
        c2values.set("boxSize", [1, 2, 1]);
      }

      components.push([component1, component2]);

      // entities.delete(0, 1);
    }
  }, "testOrigin");

  // entity.set("name2", "NewName");
  // entity.delete("name");
  // entities.delete(0, 1);
  entity.set("name", "NewName");
  c2values.set("kind", "SPHERE");
  */
</script>
