import { System, Groups, Not, Modified } from "hecs";
import { Mesh, Group, DoubleSide, MeshLambertMaterial } from "three";
import { Outline, OutlineApplied } from "../components";
import { WireframeGeometry2 } from "three/examples/jsm/lines/WireframeGeometry2";
import { Wireframe } from "three/examples/jsm/lines/Wireframe";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Object3D } from "hecs-plugin-three";

export class OutlineSystem extends System {
  order = Groups.Presentation;

  static queries = {
    added: [Outline, Not(OutlineApplied), Object3D],
    removed: [Not(Outline), OutlineApplied],
  };

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
    const object3d = entity.get(Object3D);
    if (object3d && object3d.value.children.length > 0) {
      for (const child of object3d.value.children) {
        this.outlinify(child, outline.color, outline.thickness);
      }
      entity.add(OutlineApplied);
    }
  }

  removeOutline(entity) {
    const object3d = entity.get(Object3D);
    if (object3d) {
      this.deoutlinify(object3d.value);
      entity.remove(OutlineApplied);
    }
  }

  outlinify(object, color, thickness) {
    if (object.isMesh) {
      const mesh = object;

      // Keep track so we can add Group in object's place
      const originalParent = mesh.parent;

      // Group to contain both the mesh & its outline
      const group = new Group();
      group.userData.outline = "group";

      const coloredOutline = this.createOutlineMesh(
        mesh,
        color,
        1.0 + thickness * 2,
        2
      );

      const blackOutline = this.createOutlineMesh(
        mesh,
        "black",
        1.0 + thickness * 4,
        1
      );

      // const subtractMesh = this.createSubtractionMesh(mesh);

      // Group becomes parent of the original mesh
      group.add(mesh);
      // Add outline meshes
      group.add(coloredOutline);
      group.add(blackOutline);
      // group.add(subtractMesh);

      // Put original mesh in front of both of the new outline meshes
      mesh.renderOrder = 4;

      originalParent.add(group);
    }

    for (const child of object.children) {
      this.outlinify(child, color, thickness);
    }
  }

  deoutlinify(object) {
    if (object.userData?.outline === "group") {
      const original = object.children[0];
      object.parent.add(original);
      object.parent.remove(object);

      this.deoutlinify(original);
    } else {
      for (const child of object.children) {
        this.deoutlinify(child);
      }
    }
  }

  createOutlineMesh(mesh, color, linewidth, renderOrder) {
    const geometry = new WireframeGeometry2(mesh.geometry);
    const material = new LineMaterial({
      color,
      linewidth,
    });
    material.resolution.set(window.innerWidth, window.innerHeight);
    material.depthTest = false;

    const outlineMesh = new Wireframe(geometry, material);
    outlineMesh.computeLineDistances();
    outlineMesh.scale.set(1, 1, 1);
    outlineMesh.renderOrder = renderOrder;
    outlineMesh.userData.outline = "outline";

    return outlineMesh;
  }

  createSubtractionMesh(mesh) {
    const material = new MeshLambertMaterial({
      color: 0x888888,
      side: DoubleSide,
    });
    material.depthTest = false;

    const subtractMesh = new Mesh(mesh.geometry, material);
    subtractMesh.renderOrder = 3;
    return subtractMesh;
  }
}
