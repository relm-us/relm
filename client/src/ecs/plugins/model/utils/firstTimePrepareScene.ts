import type { Group } from "three";

import { rotateSkinnedMeshBB } from "./rotateSkinnedMeshBB";
import { normalize } from "./normalize";
import { applyMaterialSettings } from "./applyMaterialSettings";

export function firstTimePrepareScene(
  scene: Group,
  backwardsCompatMode: boolean = false,
  isAvatar: boolean = false
) {
  // TODO: Find a better way to fix bounding box for skinned mesh general case
  if (isAvatar) scene.traverse(rotateSkinnedMeshBB);

  scene.traverse((node) => {
    node.castShadow = true;
  });

  // TODO: Optimization: move `normalize` to Loader?
  normalize(scene, { backwardsCompatMode });

  applyMaterialSettings(scene as any);

  return scene;
}
