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
  // Ignore `Asset`
  ecsWorld.migrations.register("Asset", (world, entity, componentData) => {});

  // Migrate from `Model` to `Model3`
  // - `Model` treats bounding box differently, so we need `compat` flag
  ecsWorld.migrations.register("Model", (world, entity, componentData) => {
    const assetUrl = componentData.asset?.url;

    entity.addByName("Model3", {
      compat: true,
      asset: assetUrl ? new Asset(assetUrl) : undefined,
    });
  });

  // Migrate from `Model2` to `Model3`
  // - `Model2` relies on a sibling `Asset` component, but
  // - `Model3` contains the asset as a property, `asset`
  ecsWorld.migrations.register(
    "Model2",
    (world, entity, componentData, data) => {
      const model3 = entity.addByName("Model3", undefined, true);
      model3.fromJSON(componentData);

      if ("Asset" in data) {
        model3.asset = new Asset(data["Asset"].value.url);
      }
    }
  );

  // Migrate from `Shape` to `Shape3`
  ecsWorld.migrations.register("Shape", (world, entity, componentData) => {
    const data = componentData;

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
  ecsWorld.migrations.register(
    "Shape2",
    (world, entity, componentData, data) => {
      const shape3 = entity.addByName("Shape3", undefined, true);
      shape3.fromJSON(componentData);
      shape3.fixedTexture = false;

      if ("Asset" in data) {
        shape3.asset = new Asset(data["Asset"].value.url);
      }
    }
  );

  ecsWorld.migrations.register(
    "Image",
    (world, entity, componentData, data) => {
      const image = entity.addByName("Image", undefined, true);
      image.fromJSON(componentData);

      if ("Asset" in data) {
        image.asset = new Asset(data["Asset"].value.url);
      }
    }
  );

  // Ignore RigidBody
  ecsWorld.migrations.register(
    "RigidBody",
    (world, entity, componentData) => {}
  );

  // Migrate from 'Collider' to 'Collider2'
  ecsWorld.migrations.register("Collider", (world, entity, componentData) => {
    const data = componentData;

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

  ecsWorld.migrations.register(
    "TranslucentOptions",
    (world, entity, componentData) => {
      // ignore
    }
  );

  ecsWorld.migrations.register("Item", (world, entity, componentData) => {
    entity.addByName("Item2", { compat: true }, true).fromJSON(componentData);
  });

  // Migrate from FaceMapColors to FaceMapColors2
  ecsWorld.migrations.register(
    "FaceMapColors",
    (world, entity, componentData) => {
      entity
        .addByName("FaceMapColors2", undefined, true)
        .fromJSON(componentData);
      // Version 2 requires "Active" component
      entity.addByName("FaceMapColorsActive");
    }
  );

  // Migrate from Bloom to Bloom2
  ecsWorld.migrations.register("Bloom", (world, entity, componentData) => {
    entity.addByName("Bloom2", undefined, true).fromJSON(componentData);
    // Version 2 requires "Active" component
    entity.addByName("Bloom2Active");
  });
}
