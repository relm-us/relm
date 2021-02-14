import { Object3D, MeshStandardMaterial } from "three";

export function traverseMaterials(
  object: Object3D,
  callback: (material: MeshStandardMaterial) => void
) {
  object.traverse((node: any) => {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material];
    materials.forEach(callback);
  });
}
