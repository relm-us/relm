import { Object3D, Mesh, Material } from "three";

export function traverseMaterials(
  object: Object3D,
  callback: (material: Material, mesh: Mesh) => boolean
) {
  object.traverse((mesh: Mesh) => {
    // Only Mesh nodes have material(s)
    if (!mesh.isMesh) return;

    if (!Array.isArray(mesh.material)) {
      return callback(mesh.material, mesh);
    } else {
      // Some Meshes can have multiple materials (but we typically don't)
      for (const mat of mesh.material) {
        const value = callback(mat, mesh);
        if (value === false) return false;
      }
    }
  });
}
