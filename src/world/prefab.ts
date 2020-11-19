import { Shape } from "hecs-plugin-three";
import { Transform } from "hecs-plugin-core";

import { Color, Vector3 } from "three";

import { RigidBody, Collider } from "~/ecs/plugins/rapier";
import { HtmlNode, CssPlane } from "~/ecs/plugins/css3d";

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

    collider = true,
  }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();
  const entity = makeEntity(world, name)
    .add(Transform, {
      position: new Vector3(x, y, z),
    })
    .add(Shape, {
      color: "#" + linearColor.getHexString(),
      boxSize: new Vector3(w, h, d),
    });
  if (collider) {
    entity
      .add(RigidBody, {
        kind: dynamic ? "DYNAMIC" : "STATIC",
      })
      .add(Collider, {
        kind: "BOX",
        boxSize: new Vector3(w, h, d),
      });
  }
  return entity;
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
    }).activate();
  }
}

export function makeBall(
  world,
  {
    name = "Ball",
    x = 0,
    y = 0,
    z = 0,
    r = 0.5,
    color = "red",
    dynamic = true,
    linearDamping = 0,
    angularDamping = 0,
    mass = 0,
    collider = true,
  }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();
  const entity = makeEntity(world, name)
    .add(Transform, {
      position: new Vector3(x, y, z),
    })
    .add(Shape, {
      kind: "SPHERE",
      color: linearColor,
      sphereRadius: r,
    });
  if (collider) {
    entity
      .add(RigidBody, {
        kind: dynamic ? "DYNAMIC" : "STATIC",
        linearDamping,
        angularDamping,
        mass,
      })
      .add(Collider, {
        shape: "SPHERE",
        sphereRadius: r,
      });
  }
  return entity;
}
export function makeYouTube(
  world,
  { x = 0, y = 0, z = 0, embedId, frameWidth, frameHeight, worldWidth }
) {
  // YouTube Video
  const iframeRatio = frameWidth / frameHeight;
  const rectangleSize = new Vector3(worldWidth, worldWidth / iframeRatio, 0.2);
  const scale = rectangleSize.x / frameWidth;
  return makeEntity(world, "Video")
    .add(Transform, {
      position: new Vector3(x, y, z),
    })
    .add(HtmlNode, {
      renderable: {
        type: "YOUTUBE",
        props: {
          width: frameWidth,
          height: frameHeight,
          embedId: embedId,
        },
      },
      scale,
    })
    .add(CssPlane, {
      kind: "RECTANGLE",
      rectangleSize,
    });
}
