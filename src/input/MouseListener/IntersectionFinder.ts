import { Camera, Intersection, Raycaster, Scene } from "three";
import { filterMap } from "~/utils/filterMap";

export class IntersectionFinder {
  raycaster: Raycaster;
  camera: Camera;
  scene: Scene;

  _intersections: Array<Intersection>;

  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new Raycaster();

    this._intersections = [];
  }

  getNormalizedCoords(screenCoords) {
    return {
      x: (screenCoords.x / window.innerWidth) * 2 - 1,
      y: -(screenCoords.y / window.innerHeight) * 2 + 1,
    };
  }

  find(screenCoords, firstOnly = false) {
    this.raycaster.setFromCamera(
      this.getNormalizedCoords(screenCoords),
      this.camera
    );

    // Reduce length to zero rather than garbage collect (speed optimization)
    this._intersections.length = 0;
    this.raycaster.intersectObject(this.scene, true, this._intersections);

    if (firstOnly && this._intersections.length > 0) {
      const object = findObjectActingAsEntityRoot(
        this._intersections[0].object
      );
      return [object];
    } else {
      return this._intersections.reduce((acc, intersection, i) => {
        const object = findObjectActingAsEntityRoot(intersection.object);
        if (object === null) return acc;
        return [...acc, object];
      }, []);
    }
  }
}

/**
 * Look for the Entity that owns an object, given that the object might be
 * a leaf in the scene graph.
 *
 * @param {Object3D} object
 */
function findObjectActingAsEntityRoot(object): string | null {
  if (object.userData.entityId) {
    return object;
  } else if (object.parent) {
    return findObjectActingAsEntityRoot(object.parent);
  } else {
    return null;
  }
}
