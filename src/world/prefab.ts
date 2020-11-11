import { Vector3 } from "hecs-plugin-core";
import { Shape } from "hecs-plugin-three";

import { Color } from "three";

import { ComposableTransform } from "~/ecs/plugins/composable";
import { RigidBody, Collider } from "~/ecs/plugins/rapier";
import { Selectable } from "~/ecs/components";

export function makeEntity(world, name) {
  return world.entities.create(name);
}

export function makeBox(
  world,
  {
    x = 0,
    y = 0,
    z = 0,
    w = 1,
    h = 1,
    d = 1,
    color = "red",
    dynamic = true,
    name = "Box",
  }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();
  return makeEntity(world, name)
    .add(ComposableTransform, {
      position: new Vector3(x, y, z),
    })
    .add(Shape, {
      color: linearColor,
      boxSize: new Vector3(w, h, d),
    })
    .add(RigidBody, {
      kind: dynamic ? "DYNAMIC" : "STATIC",
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: new Vector3(w, h, d),
    });
}

export function makePileOfBoxes(
  world,
  {
    x = -5,
    y = 5,
    z = -2,
    w = 0.5,
    h = 0.5,
    d = 0.5,
    count = 10,
    color = "gray",
  }
) {
  for (let i = 0; i < count; i++) {
    makeBox(world, {
      ...{
        x: x + Math.random() * 2 - 1,
        y: y + Math.random() * 5,
        z: z + Math.random() * 2 - 1,
      },
      ...{ w, h, d },
      color,
      name: "GrayBox",
    })
      .add(Selectable)
      .activate();
  }
}

export function makeBall(
  world,
  { x = 0, y = 0, z = 0, r = 0.5, color = "red", dynamic = true, name = "Ball" }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();
  return makeEntity(world, name)
    .add(ComposableTransform, {
      position: new Vector3(x, y, z),
    })
    .add(Shape, {
      kind: "SPHERE",
      color: linearColor,
      sphereRadius: r,
    })
    .add(RigidBody, {
      kind: dynamic ? "DYNAMIC" : "STATIC",
    })
    .add(Collider, {
      shape: "SPHERE",
      sphereRadius: r,
    });
}
