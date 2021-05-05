import { StateComponent, RefType } from "~/ecs/base";

/**
 * This class is an ECS Object3D component that shares the same name as
 * the threejs "Object3D" class, but is different. This class is a container
 * for a threejs Object3D, and helps the ECS system get a reference to
 * threejs Object3Ds when needed.
 * 
 * The `value` is a reference to a threejs Object3D.
 */
export class Object3D extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
