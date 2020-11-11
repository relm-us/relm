import { System, Groups, Not, Modified } from "hecs";
import { Mesh, Group, CustomBlending, MeshBasicMaterial } from "three";
import { Outline } from "../components/Outline";
import { OutlineApplied } from "../components/OutlineApplied";
import { ModelMesh, ShapeMesh, Object3D } from "hecs-plugin-three";

export class OutlineSystem extends System {
  order = Groups.Presentation;

  static queries = {
    added: [Outline, Not(OutlineApplied)],
    removed: [Not(Outline), OutlineApplied],
  };

  init({ effects }) {
    this.effects = effects;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.addOutline(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.removeOutline(entity);
    });
  }

  addOutline(entity) {
    const outline = entity.get(Outline);
    const mesh = entity.get(ModelMesh) || entity.get(ShapeMesh);
    const object3d = entity.get(Object3D);
    if (mesh && object3d) {
      const originalMesh = mesh.value;
      const originalParent = originalMesh.parent;

      // Group to contain both the object & its outline
      const group = new Group();

      // Remove the geometry, then add the geometry back, but now as a child of the Group
      originalParent.remove(originalMesh);
      originalMesh.renderOrder = 3; // in front of both "outline" meshes
      group.add(originalMesh);

      // Create the outline
      const whiteOutline = this.createOutlineMesh(
        originalMesh,
        outline.color,
        1.0 + outline.thickness * 0.03,
        2
      );
      group.add(whiteOutline);

      const blackOutline = this.createOutlineMesh(
        originalMesh,
        "black",
        1.0 + outline.thickness * 0.03 + outline.thickness * 0.03,
        1
      );
      group.add(blackOutline);

      originalParent.add(group);

      entity.add(OutlineApplied, { originalMesh });
    }
  }

  removeOutline(entity) {
    const applied = entity.get(OutlineApplied);
    if (applied) {
      const originalMesh = applied.originalMesh;
      const originalParent = originalMesh.parent.parent;
      const group = originalMesh.parent;
      originalParent.add(originalMesh);
      originalParent.remove(group);
      entity.remove(OutlineApplied);
    }
  }

  createOutlineMesh(mesh, color, scalingFactor, renderOrder) {
    const material = new MeshBasicMaterial({ color });
    material.blending = CustomBlending;
    material.depthTest = false;

    const outlineMesh = new Mesh(mesh.geometry, material);
    outlineMesh.renderOrder = renderOrder;
    outlineMesh.scale.set(scalingFactor, scalingFactor, scalingFactor);

    return outlineMesh;
  }
}
