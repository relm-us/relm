import { StateComponent, NumberType } from "~/ecs/base";

// Store the fact that the entity with this collider has been mapped in
// the PhysicsSystem's handleToEntityId & entityIdToHandle maps
export class ColliderMapped extends StateComponent {
  static props = {
    handle: {
      type: NumberType,
    },
  };
}
