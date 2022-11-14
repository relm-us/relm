import {
  MAX_CAPSULE_RADIAL_SEGMENTS,
  MAX_CYLINDER_SEGMENTS,
  MAX_SPHERE_WIDTH_SEGMENTS,
  ShapeType,
} from "~/types/shapes";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { Vector3, MathUtils } from "three";
import { Asset } from "~/ecs/plugins/core";
import { GROUND_INTERACTION } from "~/config/colliderInteractions";

export function registerComponentMigrations(ecsWorld: DecoratedECSWorld) {
  // Migrate from `Model` to `Model3`
  // - `Model` treats bounding box differently, so we need `compat` flag
  ecsWorld.migrations.register("Model", (world, entity, data) => {
    const assetUrl = data.asset?.url;

    entity.addByName("Model3", {
      compat: true,
      asset: new Asset(assetUrl),
    });

    entity.removeByName("Asset");
  });

  // Migrate from 'Model2' to 'Model3'
  // - `Model2` relies on a sibling `Asset` component, but
  // - `Model3` contains the asset as a property, `asset`
  ecsWorld.migrations.register("Model2", (world, entity, data) => {
    const model3 = entity.addByName("Model3", undefined, true);
    model3.fromJSON(data);

    const asset = entity.getByName("Asset");
    if (asset) {
      model3.asset = asset.value;
      entity.removeByName("Asset");
    }
  });

  // Migrate from `Shape` to `Shape3`
  ecsWorld.migrations.register("Shape", (world, entity, data) => {
    let kind: ShapeType = data.kind;
    let size: Vector3 = new Vector3(1, 1, 1);
    let detail: number = 0.25;

    switch (data.kind) {
      case "BOX":
        size.fromArray(data.boxSize);
        break;

      case "SPHERE":
        size.x = data.sphereRadius * 2;
        const avg = (data.sphereWidthSegments + data.sphereHeightSegments) / 2;
        detail = MathUtils.clamp(avg / MAX_SPHERE_WIDTH_SEGMENTS, 0.1, 1);
        break;

      case "CYLINDER":
        size.x = data.cylinderRadius * 2;
        size.y = data.cylinderHeight;
        detail = MathUtils.clamp(
          data.cylinderSegments / MAX_CYLINDER_SEGMENTS,
          0.1,
          1
        );
        break;

      case "CAPSULE":
        size.x = data.capsuleRadius * 2;
        size.y = data.capsuleHeight;
        detail = MathUtils.clamp(
          data.capsuleSegments / MAX_CAPSULE_RADIAL_SEGMENTS,
          0.1,
          1
        );
        break;
    }

    const assetUrl = data.texture?.url;
    entity.add(world.components.getByName("Shape3"), {
      kind,
      size,
      detail,
      color: data.color,
      emissive: data.emissive,
      roughness: data.roughness,
      metalness: data.metalness,
      asset: assetUrl ? new Asset(assetUrl) : undefined,
      textureScale: data.textureScale,
      fixedTexture: data.fixedTexture === undefined ? false : data.fixedTexture,
    });
  });

  // Migrate from `Shape2` to `Shape3`
  // - `Shape2` relies on a sibling `Asset` component, but
  // - `Shape3` contains the asset as a property, `asset`
  ecsWorld.migrations.register("Shape2", (world, entity, data) => {
    const shape3 = entity.addByName("Shape3", undefined, true);
    shape3.fromJSON(data);

    const asset = entity.getByName("Asset");
    if (asset) {
      shape3.asset = asset.value;
      entity.removeByName("Asset");
    }
  });

  // Ignore RigidBody
  ecsWorld.migrations.register("RigidBody", (world, entity, data) => {});

  // Migrate from 'Collider' to 'Collider2'
  ecsWorld.migrations.register("Collider", (world, entity, data) => {
    const transform = entity.getByName("Transform");
    const Collider2 = world.components.getByName("Collider2");
    const collider = entity.add(Collider2, undefined, true);

    collider.shape = data.shape;
    collider.offset.fromArray(data.offset).multiply(transform.scale);
    collider.density = data.density;

    if (data.interaction === GROUND_INTERACTION) {
      collider.kind = "GROUND";
    } else {
      collider.kind = "BARRIER";
    }

    let size = new Vector3();
    switch (data.shape) {
      case "BOX": {
        size.fromArray(data.boxSize);
        size.multiply(transform.scale);
        break;
      }

      case "SPHERE": {
        const max = Math.max(
          transform.scale.x,
          transform.scale.y,
          transform.scale.z
        );
        size.x = Math.max(0.01, data.sphereRadius * 2 * max);
        break;
      }

      case "CYLINDER": {
        const max = Math.max(transform.scale.x, transform.scale.z);
        size.x = Math.max(0.01, data.cylinderRadius * 2 * max);
        size.y = Math.max(0.01, data.cylinderHeight * transform.scale.y);
        break;
      }

      case "CAPSULE": {
        const max = Math.max(transform.scale.x, transform.scale.z);
        size.x = Math.max(0.01, data.capsuleRadius * 2 * max);
        size.y = Math.max(0.01, data.capsuleHeight * transform.scale.y);
        break;
      }
    }

    collider.size.copy(size);
  });

  ecsWorld.migrations.register("Image", (world, entity, data) => {
    entity.addByName("Image", undefined, true).fromJSON(data);

    const assetUrl = data.asset?.url;
    if (assetUrl) {
      entity.add(world.components.getByName("Asset"), {
        value: new Asset(assetUrl),
      });
    }
  });

  ecsWorld.migrations.register("TranslucentOptions", (world, entity, data) => {
    // ignore
  });

  ecsWorld.migrations.register("Item", (world, entity, data) => {
    entity.addByName("Item2", { compat: true }, true).fromJSON(data);
  });
}
