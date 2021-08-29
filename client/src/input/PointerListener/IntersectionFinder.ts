import {
  Camera,
  Intersection,
  Object3D,
  Vector2,
  Raycaster,
  Scene,
} from "three";

export class IntersectionFinder {
  raycaster: Raycaster;
  camera: Camera;
  scene: Scene;

  _intersections: Array<Intersection>;
  _normalizedCoords: Vector2;

  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new Raycaster();

    this._intersections = [];
    this._normalizedCoords = new Vector2();
  }

  getNormalizedCoords(screenCoords) {
    this._normalizedCoords.set(
      (screenCoords.x * 2) / window.innerWidth - 1,
      -(screenCoords.y * 2) / window.innerHeight + 1
    );
    return this._normalizedCoords;
  }

  castRay(screenCoords) {
    this.raycaster.setFromCamera(
      this.getNormalizedCoords(screenCoords),
      this.camera
    );
  }

  find(firstOnly = false): Set<Object3D> {
    // Reduce length to zero rather than garbage collect (speed optimization)
    this._intersections.length = 0;
    this.raycaster.intersectObject(this.scene, true, this._intersections);

    if (firstOnly && this._intersections.length > 0) {
      const object = findObjectActingAsEntityRoot(
        this._intersections[0].object
      );
      return new Set([object]);
    } else {
      return this._intersections.reduce((acc, intersection, i) => {
        const object = findObjectActingAsEntityRoot(intersection.object);
        if (object !== null) {
          // outlines and other "things" should be invisible to
          // IntersectionFinder
          if (!object.userData.nonInteractive) {
            acc.add(object);
          }
        }
        return acc;
      }, new Set<Object3D>());
    }
  }
}

/**
 * Look for the Entity that owns an object, given that the object might be
 * a leaf in the scene graph.
 *
 * @param {Object3D} object
 */
function findObjectActingAsEntityRoot(object): Object3D | null {
  if (object.userData.entityId) {
    return object;
  } else if (object.parent) {
    return findObjectActingAsEntityRoot(object.parent);
  } else {
    return null;
  }
}
