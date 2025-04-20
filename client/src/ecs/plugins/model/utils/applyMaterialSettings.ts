import { type Group, sRGBEncoding } from "three"
import { traverseMaterials } from "~/ecs/shared/traverseMaterials"

export function applyMaterialSettings(group: Group) {
  const encoding = sRGBEncoding
  traverseMaterials(group, (material: any) => {
    if (material.map) {
      material.map.encoding = encoding
      material.needsUpdate = true
    }

    if (material.emissiveMap) {
      material.emissiveMap.encoding = encoding
      material.needsUpdate = true
    }

    return true
  })
}
