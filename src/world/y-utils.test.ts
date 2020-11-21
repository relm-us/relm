import * as Y from "yjs";
import { World } from "hecs";
import { Quaternion, Vector3 } from "three";
import CorePlugin, { Transform } from "hecs-plugin-core";

import {
  addYComponentsToEntity,
  YComponents,
  YComponent,
  YValues,
} from "./y-utils";

describe("y-utils", () => {
  test("addYComponentsToEntity", () => {
    const world = new World({ plugins: [CorePlugin] });
    const entity = world.entities.create();

    const ydoc = new Y.Doc();
    const components: YComponents = ydoc.getArray("components");

    {
      const component: YComponent = new Y.Map();
      components.push([component]);

      const values: YValues = new Y.Map();
      component.set("name", "Transform");
      component.set("values", values);

      values.set("position", [1, 2, 3]);
      values.set("rotation", [0, 0, 0, 1]);
    }

    addYComponentsToEntity(entity, components);

    const transform = entity.get(Transform);
    expect(transform).toBeDefined();
    expect((transform.position as Vector3).equals(new Vector3(1, 2, 3)));
    expect(
      (transform.rotation as Quaternion).equals(new Quaternion(0, 0, 0, 1))
    );
  });
});
