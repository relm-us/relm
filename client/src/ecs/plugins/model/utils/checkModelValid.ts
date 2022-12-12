import { BufferGeometry, Group, Mesh } from "three";

export type Validity = { type: "ok" } | { type: "invalid"; reason: string };

export function checkModelValid(scene: Group): Validity {
  if (!scene) return { type: "invalid", reason: "no scene" };

  let validity: Validity = { type: "ok" };

  scene.traverse((node) => {
    const geometry: BufferGeometry = (node as Mesh).geometry;
    if (geometry) {
      const attrs = Object.entries(geometry.attributes);
      for (const [attrName, attrVal] of attrs) {
        if (!attrVal) {
          validity = {
            type: "invalid",
            reason: `attribute ${attrName} is null`,
          };
        }
      }
    }
  });

  return validity;
}
