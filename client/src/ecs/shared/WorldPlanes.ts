import { Vector2, Vector3, Plane, Raycaster, PerspectiveCamera } from "three";

export type PlaneOrientation = "xz" | "xy";

export type GetWorldFromScreenOpts = {
  plane?: PlaneOrientation;
  camera?: PerspectiveCamera;
};

const _raycaster: Raycaster = new Raycaster();
const _intersect: Vector3 = new Vector3();
const _vec2: Vector2 = new Vector2();

const upward = new Vector3(0, 1, 0);
const inward = new Vector3(0, 0, 1);

/**
 * Converts 2d screen coordinates to 3d world coordinates, on two planes:
 *   xz: a plane pointing "up"
 *   xy: a plane pointing "in"
 * 
 * This class is optimized to re-calculate world coordinates quickly in a
 * loop, e.g. to get an up-to-date mouse position in world space.
 */
export class WorldPlanes {
  /**
   * The camera to use when projecting screen coordinates to world coords
   */
  camera: PerspectiveCamera;

  /**
   * The "origin" of the planes; e.g. the participant's avatar
   */
  origin: Vector3;

  /**
   * The 2d screen size, in pixels
   */
  screenSize: Vector2;

  /**
   * The planes we'll keep updated at the origin point, so we can calculate (mouse) world coords
   */
  planes: Record<PlaneOrientation, Plane> = {
    xz: new Plane(upward, -0.01),
    xy: new Plane(inward, -0.01),
  };

  /**
   * The points we'll keep updated (e.g. mouse position)
   */
  points: Record<PlaneOrientation, Vector3> = {
    xz: new Vector3(),
    xy: new Vector3(),
  };

  constructor(camera: PerspectiveCamera, origin: Vector3, screenSize: Vector2) {
    this.camera = camera;
    this.origin = origin;
    this.screenSize = screenSize;
  }

  getWorldFromScreen(
    coord: Vector2,
    target: Vector3 = _intersect,
    { plane = "xz", camera = this.camera }: GetWorldFromScreenOpts = {}
  ): Vector3 {
    _vec2.set(
      (coord.x * 2) / this.screenSize.width - 1,
      (-coord.y * 2) / this.screenSize.height + 1
    );
    return this.getWorldFromNormalizedScreen(_vec2, target, {
      plane,
      camera,
    });
  }

  getWorldFromNormalizedScreen(
    coord: Vector2,
    target: Vector3 = _intersect,
    { plane = "xz", camera = this.camera }: GetWorldFromScreenOpts = {}
  ): Vector3 {
    _raycaster.setFromCamera(coord, camera);
    _raycaster.ray.intersectPlane(this.planes[plane], target);
    return target;
  }

  update(point?: Vector2) {
    if (!this.origin) return;

    // Set both planes to origin
    this.planes.xz.constant = -this.origin.y;
    this.planes.xy.constant = -this.origin.z;

    // If a 2d point on the screen is given, calculate its 3d world coords on both planes
    if (point) {
      this.getWorldFromScreen(point, this.points.xz, { plane: "xz" });
      this.getWorldFromScreen(point, this.points.xy, { plane: "xy" });
    }
  }
}