import * as THREE from "three";
import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";

import { DirectionalLight, DirectionalLightRef } from "../components";

import { shadowMapConfig } from "~/config/constants";
import { Presentation } from "~/ecs/plugins/core/Presentation";

let helper;
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
        const resolution = {
          width: spec.shadowWidth,
          height: spec.shadowHeight,
        };
        this.buildShadow(
          light,
          spec.shadowRadius,
          resolution,
          this.getFrustumFromSpec(spec)
        );

        // helper = new THREE.CameraHelper(light.shadow.camera);
        // this.presentation.scene.add(helper);
      }
      entity.add(DirectionalLightRef, { value: light });
    });

    this.queries.active.forEach((entity) => {
      const light = entity.get(DirectionalLightRef).value;
      const size = Math.max(
        this.presentation.visibleBounds.max.x -
          this.presentation.visibleBounds.min.x,
        this.presentation.visibleBounds.max.y -
          this.presentation.visibleBounds.min.y
      );
      // size ranges from about 10 to 60
      // zoom ranges from about 1 to 0.30
      light.shadow.camera.zoom = (1 - (size - 10) / 50) * 0.5 + 0.2;
      light.shadow.camera.updateProjectionMatrix();
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

  getFrustumFromSpec(spec) {
    return {
      top: spec.shadowTop,
      bottom: spec.shadowBottom,
      left: spec.shadowLeft,
      right: spec.shadowRight,
      near: spec.shadowNear,
      far: spec.shadowFar,
    };
  }
}
