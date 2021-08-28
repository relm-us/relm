import { Entity, System, Groups, Not, Modified } from "~/ecs/base";
import { Presentation, Object3D } from "~/ecs/plugins/core";
import { Diamond, DiamondRef } from "../components";
import { Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { GlowShader } from "../GlowShader";

const PI_THIRDS = Math.PI / 3.0;

export class DiamondSystem extends System {
  order = Groups.Simulation + 1;

  presentation: Presentation;

  static queries = {
    new: [Diamond, Object3D, Not(DiamondRef)],
    modified: [Modified(Diamond), DiamondRef],
    active: [Diamond, DiamondRef],
    removed: [Not(Diamond), DiamondRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update(delta) {
    const d = 1 / (1000 / delta);
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.active.forEach((entity) => {
      const spec = entity.get(Diamond);
      const ref = entity.get(DiamondRef);
      if (ref.loaded) {
        ref.time += spec.speed * Math.PI * d;
        this.setKernelScale(ref.diamond.scale, ref.time);
        this.setDiamondRotation(ref.glow.rotation, ref.time);
      }
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  async build(entity: Entity) {
    const object3d = entity.get(Object3D).value;

    if (!entity.has(DiamondRef)) {
      entity.add(DiamondRef);
    }

    const diamondMesh = await this.presentation.loadGltf("/diamond.glb");
    const ref = entity.get(DiamondRef);
    if (ref) {
      ref.diamond = this.createKernel(diamondMesh);
      object3d.add(ref.diamond);

      ref.glow = this.createDiamond();
      object3d.add(ref.glow);

      ref.loaded = true;
    }
  }

  remove(entity: Entity) {
    const ref = entity.get(DiamondRef);

    const object3d = entity.get(Object3D);
    if (object3d) {
      if (ref.diamond) object3d.value.remove(ref.diamond);
      if (ref.glow) object3d.value.remove(ref.glow);
    }

    entity.remove(DiamondRef);
  }

  // The small orange "kernel" at the interior of the diamond
  createKernel(diamondMesh) {
    const material = new MeshStandardMaterial({
      color: 0xff6600,
      transparent: true,
    });
    const geometry = diamondMesh.scene.getObjectByName("Diamond").geometry;

    const diamond = new Mesh(geometry, material);
    this.setKernelScale(diamond.scale, 0);
    diamond.rotation.z = Math.PI / 2;
    diamond.rotation.x = Math.PI / 8;

    return diamond;
  }

  setKernelScale(scale, time) {
    scale.x = (10.0 + Math.sin(time + PI_THIRDS * 0) * 3.0) / 200;
    scale.y = (12.0 + Math.sin(time + PI_THIRDS * 1) * 3.0) / 200;
    scale.z = (14.0 + Math.sin(time + PI_THIRDS * 2) * 3.0) / 200;
  }

  // The translucent outer diamond shell
  createDiamond() {
    const geometry = new SphereGeometry(1 / 60, 0, 0);

    const glow = new Mesh(geometry, GlowShader);
    this.setDiamondRotation(glow.rotation, 0);
    glow.scale.set(8, 24, 8);

    return glow;
  }

  setDiamondRotation(rotation, time) {
    rotation.y = time / 2.0;
  }
}
