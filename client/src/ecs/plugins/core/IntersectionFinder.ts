import type { Camera, Intersection, Object3D, Scene } from "three"
import { Vector2, Vector3, Raycaster } from "three"

const direction = new Vector3()

export class IntersectionFinder {
  raycaster: Raycaster
  camera: Camera
  scene: Scene
  foundSet: Set<Object3D> = new Set()

  _intersections: Array<Intersection>
  _normalizedCoord: Vector2

  constructor(camera, scene) {
    this.camera = camera
    this.scene = scene
    this.raycaster = new Raycaster()

    this._intersections = []
    this._normalizedCoord = new Vector2()
  }

  getNormalizedCoord(screenCoord) {
    this._normalizedCoord.set(
      (screenCoord.x * 2) / window.innerWidth - 1,
      -(screenCoord.y * 2) / window.innerHeight + 1,
    )
    return this._normalizedCoord
  }

  castRay(screenCoord) {
    this.raycaster.far = Number.POSITIVE_INFINITY
    this.raycaster.setFromCamera(this.getNormalizedCoord(screenCoord), this.camera)
  }

  find(visibleCandidates?: Object3D[]): Object3D[] {
    if (!visibleCandidates) {
      visibleCandidates = []
      this.scene.traverseVisible((object) => visibleCandidates.push(object))
    }

    // Reduce length to zero rather than garbage collect (speed optimization)
    this._intersections.length = 0

    this.raycaster.intersectObjects(visibleCandidates, false, this._intersections)

    return findIntersectionRoots(this._intersections)
  }

  prepareRaycastBetween(source: Vector3, target: Vector3) {
    direction.copy(target).sub(source).normalize()
    this.raycaster.camera = this.camera
    this.raycaster.far = source.distanceTo(target)
    this.raycaster.set(source, direction)

    return this.raycaster
  }

  findBetween(source: Vector3, target: Vector3, visibleCandidates?: Object3D[]): Object3D[] {
    this.prepareRaycastBetween(source, target)
    return this.find(visibleCandidates)
  }

  entityIdsAt(screenCoord: Vector2) {
    this.castRay(screenCoord)
    const findings = [...this.find()]
    return findings.map((object) => object.userData.entityId)
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
    return object
  }

  if (object.parent) {
    return findObjectActingAsEntityRoot(object.parent)
  }

  return null
}

export function findIntersectionRoots(intersections) {
  const roots = []
  for (let intersection of intersections) {
    const object = findObjectActingAsEntityRoot(intersection.object)
    if (object !== null) {
      // outlines and other things should be invisible to IntersectionFinder
      if (!object.userData.nonInteractive) {
        object.userData.lastIntersectionPoint = intersection.point
        roots.push(object)
      }
    }
  }
  return roots
}
