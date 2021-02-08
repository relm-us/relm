import * as THREE from "three";
import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Object3D } from "~/ecs/plugins/three";

import { DirectionalLight, DirectionalLightRef } from "../components";

import { shadowMapConfig } from "~/stores/config";
import { Presentation } from "~ecs/plugins/three/Presentation";

export class DirectionalLightSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization;

  static queries = {
    added: [DirectionalLight, Object3D, Not(DirectionalLightRef)],
    active: [DirectionalLight, DirectionalLightRef],
    modified: [Modified(DirectionalLight), DirectionalLightRef],
    removed: [Not(DirectionalLight), DirectionalLightRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      const spec = entity.get(DirectionalLight);
      const light = this.buildLight(
        entity,
        spec.color,
        spec.intensity,
        spec.target
      );
      if (spec.shadow) {
        const frustum = {
          top: spec.shadowTop,
          bottom: spec.shadowBottom,
          left: spec.shadowLeft,
          right: spec.shadowRight,
          near: spec.shadowNear,
          far: spec.shadowFar,
        };
        const resolution = {
          width: spec.shadowWidth,
          height: spec.shadowHeight,
        };
        this.buildShadow(light, spec.shadowRadius, resolution, frustum);
        // this.presentation.scene.add(
        //   new THREE.CameraHelper(light.shadow.camera)
        // );
      }
      entity.add(DirectionalLightRef, { value: light });
    });

    this.queries.active.forEach((entity) => {
      const spec = entity.get(DirectionalLight);
      if (spec.shadowDistanceGrowthRatio) {
        const transform = entity.get(Transform);
        const light = entity.get(DirectionalLightRef).value;

        const dist = (transform.position as THREE.Vector3).distanceTo(
          light.target.position
        );
        if (spec.shadowDistance && Math.abs(dist - spec.shadowDistance) < 0.5) {
          return;
        } else {
          // console.log("DirectionalLightSystem: recalc shadow size");
        }

        const size = dist / spec.shadowDistanceGrowthRatio;
        light.shadow.camera.top = spec.shadowTop * size;
        light.shadow.camera.bottom = spec.shadowBottom * size;
        light.shadow.camera.left = spec.shadowLeft * size;
        light.shadow.camera.right = spec.shadowRight * size;
        light.shadow.needsUpdate = true;

        spec.shadowDistance = dist;
      }
    });

    // this.queries.modified.forEach((entity) => {});
    // this.queries.removed.forEach((entity) => {});
  }

  buildLight(
    entity,
    color: string,
    intensity: number,
    targetEntityId?: string
  ) {
    const object3d = entity.get(Object3D);
    const light = new THREE.DirectionalLight(color, intensity);

    object3d.value.add(light);

    if (targetEntityId) {
      const targetEntity: Entity = this.world.entities.getById(targetEntityId);
      if (targetEntity) {
        // DirectionalLight will point towards target entity, if provided
        const target = targetEntity.get(Object3D);
        light.target = target.value;
      } else {
        console.warn(
          `DirectionalLight's target entity is invalid; ` +
            `light will point towards origin`,
          targetEntityId
        );
      }
    } else {
      // If no target entity is provided, DirectionalLight will "float",
      // always pointing in same direction
      // TODO: FixMe
      light.target.position.x = -object3d.value.position.x;
      light.target.position.y = -object3d.value.position.y;
      light.target.position.z = -object3d.value.position.z;
      object3d.value.add(light.target);
    }

    return light;
  }

  buildShadow(light, radius, resolution, frustum) {
    light.castShadow = true;

    light.shadow.mapSize.height = resolution.height;
    light.shadow.mapSize.width = resolution.width;

    light.shadow.camera.top = frustum.top;
    light.shadow.camera.bottom = frustum.bottom;
    light.shadow.camera.left = frustum.left;
    light.shadow.camera.right = frustum.right;
    light.shadow.camera.near = frustum.near;
    light.shadow.camera.far = frustum.far;

    light.shadow.radius = radius;

    switch (shadowMapConfig) {
      case "BASIC":
        break;
      case "PCF":
        light.shadow.normalBias = 0.1;
        light.shadow.bias = 0.0008;
        break;
      case "VSM":
        light.shadow.bias = -0.0002;
        break;
    }
  }
}
