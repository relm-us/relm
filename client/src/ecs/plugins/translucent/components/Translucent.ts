import { NumberType, LocalComponent } from "~/ecs/base";

export class Translucent extends LocalComponent {
  opacity: number;

  static props = {
    opacity: {
      type: NumberType,
      default: 0.5,
    },
  };

  // Not an editor component for now, because we use Translucent to indicate build mode
}
