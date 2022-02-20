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
  candidateObjectsCache: Object3D[] = [];
  candidateObjectsCacheNeedsUpdate: boolean = true;
  foundSet: Set<Object3D> = new Set();

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
    if (this.candidateObjectsCacheNeedsUpdate) {
      this.candidateObjectsCacheNeedsUpdate = false;
      this.candidateObjectsCache.length = 0;
      // this.camera.
      this.scene.traverseVisible((object) =>
        this.candidateObjectsCache.push(object)
      );
    }

    // Reduce length to zero rather than garbage collect (speed optimization)
    this._intersections.length = 0;

    // console.log("visible cache", this.candidateObjectsCache.length);
    this.raycaster.intersectObjects(
      this.candidateObjectsCache,
      false,
      this._intersections
    );

    this.foundSet.clear();

    for (let intersection of this._intersections) {
      const object = findObjectActingAsEntityRoot(intersection.object);
      if (object !== null) {
        // outlines and other things should be invisible to IntersectionFinder
        if (!object.userData.nonInteractive) {
          object.userData.lastIntersectionPoint = intersection.point;
          this.foundSet.add(object);
        }
      }
    }

    return this.foundSet;
  }

  findBetween(source: Vector3, target: Vector3): Set<Object3D> {
    direction.copy(target).sub(source).normalize();
    this.raycaster.camera = this.camera;
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
