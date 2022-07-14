import { Entity, LocalComponent, RefType } from "~/ecs/base";

export class TransformControls extends LocalComponent {
  onChange: () => void;
  onMouseUp: (entity: Entity) => void;

  static props = {
    onChange: {
      type: RefType,
    },

    onMouseUp: {
      type: RefType,
    },
  };
}
