import { Group, sRGBEncoding } from "three";
import { traverseMaterials } from "~/ecs/shared/traverseMaterials";

export function applyMaterialSettings(group: Group) {
  const encoding = sRGBEncoding;
  traverseMaterials(group, (material) => {
    if (material.map) material.map.encoding = encoding;
    if (material.emissiveMap) material.emissiveMap.encoding = encoding;
    if (material.map || material.emissiveMap) material.needsUpdate = true;
  });
}
