import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import { Mesh, Group } from "three";

import { ERROR_GLTF } from "~/config/constants";

import { Entity, System, Not, Modified, Groups, EntityId } from "~/ecs/base";
import { Object3DRef, Presentation } from "~/ecs/plugins/core";
import { Asset, AssetLoaded } from "~/ecs/plugins/asset";
import { clone } from "~/ecs/shared/SkeletonUtils";

import { rotateSkinnedMeshBB } from "../utils/rotateSkinnedMeshBB";
import { normalize } from "../utils/normalize";
import { applyMaterialSettings } from "../utils/applyMaterialSettings";

import { Model2, Model2Ref } from "../components";

const cache: Map<string, Group> = new Map();

export class Model2System extends System {
  errorScene: Group;

  // Must be after AssetSystem
  order = Groups.Initialization + 10;

  static queries = {
    added: [Model2, AssetLoaded, Not(Model2Ref)],
    modifiedAsset: [Model2, Modified(Asset)],
    removed: [Model2Ref, Not(Model2)],
    removedAsset: [Model2Ref, Not(Asset)],
  };

  init({ presentation }: { presentation: Presentation }) {
    presentation.loadGltf(ERROR_GLTF).then((gltf) => {
      this.errorScene = this.firstTimePrepareScene(gltf.scene, false, false);
    });
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.modifiedAsset.forEach((entity) => {
      this.remove(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });

    this.queries.removedAsset.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec: Model2 = entity.get(Model2);
    const loaded: AssetLoaded = entity.get(AssetLoaded);

    if (loaded.error) {
      return this.error(entity, loaded.error);
    } else if (loaded.kind !== "GLTF") {
      return this.error(
        entity,
        `model expects glTF, found '${loaded.kind}' (${entity.id})`
      );
    }

    const gltf = loaded.value as GLTF;

    let scene;
    if (entity.hasByName("Animation")) {
      // Must clone scene when it includes animations
      scene = this.firstTimePrepareScene(
        clone(gltf.scene),
        spec.compat,
        entity.name === "Avatar"
      );
    } else {
      scene = this.getScene(
        gltf.scene,
        entity.id,
        loaded.cacheKey,
        spec.compat
      );
    }

    entity.add(Model2Ref, { value: { ...gltf, scene } });

    this.attach(entity);
  }

  remove(entity: Entity) {
    const ref: Mesh = entity.get(Model2Ref)?.value;

    if (ref) {
      this.detach(entity);

      ref.geometry?.dispose();
    }

    entity.maybeRemove(Model2Ref);
  }

  attach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    if (object3dref) {
      const object3d = object3dref.value;

      const gltf: GLTF = entity.get(Model2Ref).value;
      object3d.add(gltf.scene);

      // Notify dependencies (e.g. colliders) that object3d has changed
      object3dref.modified();
    }
  }

  detach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    if (object3dref) {
      const object3d = object3dref.value;

      const child: GLTF = entity.get(Model2Ref).value;
      object3d.remove(child.scene);

      // Notify dependencies (e.g. colliders) that object3d has changed
      object3dref.modified();
    }
  }

  error(entity: Entity, msg = null) {
    if (msg) {
      console.warn(msg, entity.id);
    }

    if (!this.errorScene) return;

    entity.add(Model2Ref, {
      value: {
        scene: clone(this.errorScene),
        animations: [],
      },
    });

    entity.addByName("Html2d", {
      kind: "INFO",
      title: "Error",
      content: msg,
      zoomInvariant: false,
    });

    return this.attach(entity);
  }

  firstTimePrepareScene(
    scene: Group,
    backwardsCompatMode: boolean = false,
    isAvatar: boolean = false
  ) {
    // TODO: Find a better way to fix bounding box for skinned mesh general case
    if (isAvatar) scene.traverse(rotateSkinnedMeshBB);

    scene.traverse((e) => (e.castShadow = true));

    // TODO: Optimization: move `normalize` to Loader?
    normalize(scene, { backwardsCompatMode });

    applyMaterialSettings(scene as any);

    return scene;
  }

  // Use cached GLTF scene if available; otherwise cache fresh scene and return
  getScene(
    scene: Group,
    entityId: EntityId,
    cacheKey: string,
    compatMode: boolean = false
  ) {
    const key = `${entityId}/${cacheKey}/${compatMode ? 1 : 0}`;

    if (!cache.has(key)) {
      cache.set(key, this.firstTimePrepareScene(scene, compatMode, false));
    }

    return cache.get(key);
  }
}
