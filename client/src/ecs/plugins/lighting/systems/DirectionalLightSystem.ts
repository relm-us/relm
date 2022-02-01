import * as THREE from "three";
import { MathUtils } from "three";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import { Perspective } from "~/ecs/plugins/perspective";

import { DirectionalLight, DirectionalLightRef } from "../components";

import { shadowMapConfig } from "~/config/constants";
import { Vector3 } from "three";

let helper;
export class DirectionalLightSystem extends System {
  count: number;
  perspective: Perspective;

  order = Groups.Initialization;

  static queries = {
    added: [DirectionalLight, Object3D, Not(DirectionalLightRef)],
    active: [DirectionalLight, DirectionalLightRef],
    modified: [Modified(DirectionalLight), DirectionalLightRef],
    removed: [Not(DirectionalLight), DirectionalLightRef],
  };

  init({ perspective }) {
    this.perspective = perspective;
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
      }
      entity.add(DirectionalLightRef, { value: light });
    });

    this.queries.active.forEach((entity) => {
      const light = entity.get(DirectionalLightRef).value;
      const vb = this.perspective.visibleBounds;
      const size = Math.max(vb.max.x - vb.min.x, vb.max.y - vb.min.y);

      let zoom;
      if ((window as any).zoom) {
        // manual override for testing
        zoom = (window as any).zoom;
      } else {
        const size2 = 2 * Math.atan(size / (2 * 10)) * (180 / Math.PI);
        const rangeZeroToOne =
          (MathUtils.clamp(size2, 54, 140) - 54) / (140 - 54);
        zoom = (1 - rangeZeroToOne) * 1.5 + 0.25;
      }
      light.shadow.camera.zoom = zoom;
      light.shadow.camera.updateProjectionMatrix();

      if (light.helper) {
        light.helper.update();
      }
    });

    this.queries.modified.forEach((entity) => {
      const spec = entity.get(DirectionalLight);
      const light = entity.get(DirectionalLightRef).value;
      if (spec.shadow && !light.castShadow) {
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
      } else if (!spec.shadow && light.castShadow) {
        light.castShadow = false;
      }
    });
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
    light.shadow.camera.updateProjectionMatrix();

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

    // light.helper = new THREE.CameraHelper(light.shadow.camera);
    // this.perspective.presentation.scene.add(light.helper);
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
