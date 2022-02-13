import {
  Camera,
  Intersection,
  Object3D,
  Vector2,
  Raycaster,
  Scene,
  Vector3,
} from "three";

const direction = new Vector3();

export class IntersectionFinder {
  raycaster: Raycaster;
  camera: Camera;
  scene: Scene;

  _intersections: Array<Intersection>;
  _normalizedCoord: Vector2;

  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new Raycaster();

    this._intersections = [];
    this._normalizedCoord = new Vector2();
  }

  getNormalizedCoord(screenCoord) {
    this._normalizedCoord.set(
      (screenCoord.x * 2) / window.innerWidth - 1,
      -(screenCoord.y * 2) / window.innerHeight + 1
    );
    return this._normalizedCoord;
  }

  castRay(screenCoord) {
    this.raycaster.far = Infinity;
    this.raycaster.setFromCamera(
      this.getNormalizedCoord(screenCoord),
      this.camera
    );
  }

  find(): Set<Object3D> {
    // Reduce length to zero rather than garbage collect (speed optimization)
    this._intersections.length = 0;
    this.raycaster.intersectObject(this.scene, true, this._intersections);

    return this._intersections.reduce((acc, intersection, i) => {
      const object = findObjectActingAsEntityRoot(intersection.object);
      if (object !== null) {
        // outlines and other things should be invisible to IntersectionFinder
        if (!object.userData.nonInteractive) {
          object.userData.lastIntersectionPoint = intersection.point;
          acc.add(object);
        }
      }
      return acc;
    }, new Set<Object3D>() /* TODO: don't alloc new Set every time */);
  }

  findBetween(source: Vector3, target: Vector3): Set<Object3D> {
    direction.copy(target).sub(source).normalize();
    this.raycaster.far = source.distanceTo(target);
    this.raycaster.set(source, direction);
    return this.find();
  }

  entityIdsAt(screenCoord: Vector2) {
    this.castRay(screenCoord);
    const findings = [...this.find()];
    return findings.map((object) => object.userData.entityId);
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
